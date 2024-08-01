"use client";
import { useUser } from "@propelauth/nextjs/client";
import { useOrgContext } from "@/components/context/OrgContext";
import {
  Spinner,
  Card,
  Radio,
  RadioGroup,
  Image,
  Button,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import { createOrg } from "@/helpers/request";
import { getData } from "@/helpers/frontend";
import { patchOrg } from "@/helpers/request";
import RainforestPayment from "@/components/Payment/RainforestPayment";
import SubscriptionManager from "@/components/SubscriptionManager";
import SubscriptionModal from "@/components/Modals/SubscriptionModal";

const Settings = () => {
  const { loading, isLoggedIn, user } = useUser();
  const { currentOrg } = useOrgContext();
  const [selectedService, setSelectedService] = useState("woocommerce");
  const [org, setOrg] = useState<any>({});
  const [error, setError] = useState<string>("");
  const [orgLoading, setOrgLoading] = useState<boolean>(false);
  const [sessionKey, setSessionKey] = useState<string | null>(null);
  const [payinConfigId, setPayinConfigId] = useState<string | null>(null);
  const [amount] = useState<string>("100.00");
  const [subscriptions, setSubscriptions] = useState([]);
  const [isCreatingPayinConfig, setIsCreatingPayinConfig] =
    useState<boolean>(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);

  const validOptions = ["woocommerce"];
  const isInvalid = !validOptions.includes(selectedService);

  useEffect(() => {
    if (isLoggedIn && !loading && !orgLoading && currentOrg) {
      fetchOrgData(currentOrg);
    }
  }, [currentOrg, isLoggedIn, loading]);

  const fetchOrgData = async (orgId: string) => {
    const url = `/api/org/propelauth/${orgId}`;
    const method = "GET";
    const headers = {
      "Content-Type": "application/json",
    };
    getData(
      "org",
      url,
      method,
      headers,
      (data) => {
        setOrg(data || {});
        setSubscriptions(data.subscriptions || []);
      },
      setError,
      setOrgLoading
    );
  };

  useEffect(() => {
    console.log("Checkout Page: use effect launched");
    const fetchSession = async () => {
      try {
        const response = await fetch("api/rainforest/session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            // TODO fix this for the future
            sessionType: "",
            merchantId: "",
          }),
        });
        const result = await response.json();
        console.log("Got session key for payment: ", result);

        const sessionKey = result.response.data.session_key;
        setSessionKey(sessionKey);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unknown error occurred for grabbing session key"
        );
      }
    };

    if (!sessionKey) {
      fetchSession();
    }
  }, [sessionKey]);

  function getPropelAuthOrg(orgId?: string) {
    if (!orgId) {
      return null;
    }
    return user?.getOrg(orgId);
  }

  const getOrg = async (orgId: string) => {
    const url = `/api/org/propelauth/${orgId}`;
    const method = "GET";
    const headers = {
      "Content-Type": "application/json",
    };
    getData("org", url, method, headers, setOrg, setError, setOrgLoading);
  };

  const handleSave = async () => {
    setOrgLoading(true);
    console.log("Org: ", org);
    if (org && Object.keys(org).length > 0) {
      await patchOrg(org.orgid, { service: selectedService });
    } else {
      const body = {
        orgid: currentOrg,
        name: getPropelAuthOrg(currentOrg)?.orgName,
        service: selectedService,
      };
      await createOrg(body);
    }
    getOrg(currentOrg);
    setOrgLoading(false);
  };

  const createPayinConfig = async (amountInCents: number) => {
    setIsCreatingPayinConfig(true);
    try {
      const response = await fetch("api/rainforest/create-payin-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amountInCents,
        }),
      });
      const result = await response.json();

      console.log("Got the payin config: ", result);

      const payinConfigId = result.response.data.payin_config_id;
      setPayinConfigId(payinConfigId);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unknown error occurred for grabbing payin config"
      );
    } finally {
      setIsCreatingPayinConfig(false);
    }
  };

  const handleCreatePayinConfig = () => {
    const amountInCents = Math.round(parseFloat(amount) * 100);
    createPayinConfig(amountInCents);
  };

  const handleManageSubscription = (subscription: any) => {
    setSelectedSubscription(subscription);
    setIsSubscriptionModalOpen(true);
  };

  const handleSubscriptionUpdate = () => {
    fetchOrgData(currentOrg);
  };

  const renderPaymentBox = () => {
    if (sessionKey && payinConfigId) {
      return (
        <RainforestPayment
          sessionKey={sessionKey}
          payinConfigId={payinConfigId}
          org={org}
        ></RainforestPayment>
      );
    } else if (isCreatingPayinConfig) {
      return <Spinner label="Loading Payment Settings" />;
    }
  };

  const renderPaymentSettings = () => {
    if (org && Object.keys(org).length > 0) {
      return (
        <>
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">Payment Settings</h3>
            <div className="flex items-center space-x-4">
              {renderSubscriptionCards()}
            </div>
          </div>
          <div className="mb-4">{renderPaymentBox()}</div>
        </>
      );
    }
  };

  const renderSubscriptionCards = () => {
    if (subscriptions.length === 0) {
      return (
        <>
          <Button
            color="primary"
            onClick={handleCreatePayinConfig}
            isLoading={isCreatingPayinConfig}
          >
            Pay $100.00
          </Button>
        </>
      );
    }

    return subscriptions.map((subscription: any) => (
      <SubscriptionManager
        key={subscription._id}
        subscription={subscription}
        onManage={() => handleManageSubscription(subscription)}
      />
    ));
  };

  const renderSettingPage = () => {
    if (orgLoading) {
      return (
        <div className="flex justify-center items-center h-screen">
          <Spinner label="Loading Settings" />
        </div>
      );
    } else {
      return (
        <Card className="p-6 m-4">
          <h2 className="text-2xl font-bold mb-4">Store Settings</h2>
          <div className="mb-4">
            <p>
              <strong>Name:</strong>{" "}
              {org?.name || getPropelAuthOrg(currentOrg)?.orgName || "No Name"}
            </p>
          </div>
          {error && (
            <div className="mb-4 text-red-500">
              <p>{error}</p>
            </div>
          )}
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">
              What service are you using?
            </h3>
            <RadioGroup
              value={selectedService}
              onValueChange={setSelectedService}
              orientation="horizontal"
              isInvalid={isInvalid}
              color="success"
            >
              <Radio value="woocommerce">
                <div className="flex items-center">
                  <Image
                    alt="Woocommerce Icon"
                    src="https://upload.wikimedia.org/wikipedia/commons/2/2a/WooCommerce_logo.svg"
                    width={30}
                  />
                </div>
              </Radio>
            </RadioGroup>
          </div>
          {renderPaymentSettings()}
          <Button color="primary" onClick={handleSave} isLoading={orgLoading}>
            Save Settings
          </Button>
        </Card>
      );
    }
  };
  return (
    <>
      {renderSettingPage()}
      {selectedSubscription && (
        <SubscriptionModal
          isOpen={isSubscriptionModalOpen}
          onClose={() => setIsSubscriptionModalOpen(false)}
          subscription={selectedSubscription}
          onUpdate={handleSubscriptionUpdate}
        />
      )}
    </>
  );
};

export default Settings;
