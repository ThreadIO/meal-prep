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
import { useState, useEffect } from "react";
import { createOrg, patchOrg } from "@/helpers/request";
import RainforestPayment from "@/components/Payment/RainforestPayment";
import SubscriptionManager from "@/components/SubscriptionManager";
import SubscriptionModal from "@/components/Modals/SubscriptionModal";
import { useQueryClient } from "react-query";
import ApplicationStatusCard from "@/components/Settings/EnhancedApplicationStatusCard";
import RainforestOnboarding from "@/components/Rainforest/RainforestOnboarding";

const Settings = () => {
  const { loading: authLoading, user } = useUser();
  const {
    org,
    isLoading: orgLoading,
    error: orgError,
    currentOrg,
  } = useOrgContext();
  const [selectedService, setSelectedService] = useState("woocommerce");
  const [sessionKey, setSessionKey] = useState<string | null>(null);
  const [onboardingSessionKey, setOnboardingSessionKey] = useState<
    string | null
  >(null);
  const [payinConfigId, setPayinConfigId] = useState<string | null>(null);
  const [merchant, setMerchant] = useState<any>(null);
  const [amount] = useState<string>("100.00");
  const [subscriptions, setSubscriptions] = useState([]);
  const [isCreatingPayinConfig, setIsCreatingPayinConfig] =
    useState<boolean>(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [isOnboarding, setIsOnboarding] = useState(false);

  const queryClient = useQueryClient();

  const validOptions = ["woocommerce"];
  const isInvalid = !validOptions.includes(selectedService);

  const pa_Org = user?.getOrg(currentOrg);
  const isOwner = pa_Org?.isRole("Owner");

  useEffect(() => {
    if (org) {
      setSelectedService(org.service || "woocommerce");
      setSubscriptions(org.subscriptions || []);
      fetchMerchant();
    }
  }, [org]);

  useEffect(() => {
    if (
      merchant &&
      merchant.latest_merchant_application.status === "NEEDS_INFORMATION"
    ) {
      setIsOnboarding(true);
    }
  }, [merchant]);

  useEffect(() => {
    if (!sessionKey) {
      fetchSession("", org.rainforest.merchantid, setSessionKey);
    }
  }, [sessionKey]);

  const fetchMerchant = async () => {
    const response = await fetch("/api/rainforest/get-merchants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: org.name }),
    });
    const data = await response.json();
    setMerchant(data.data[0]);
  };

  const fetchSession = async (
    sessionType: string,
    merchantId: string,
    // eslint-disable-next-line no-unused-vars
    onSuccess: (data: any) => void
  ) => {
    try {
      const response = await fetch("api/rainforest/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionType: sessionType,
          merchantId: merchantId,
        }),
      });
      const result = await response.json();
      onSuccess(result.response.data.session_key);
    } catch (error) {
      console.error("Error fetching session key:", error);
    }
  };

  const handleSave = async () => {
    if (org && Object.keys(org).length > 0) {
      await patchOrg(org.orgid, { service: selectedService });
    } else {
      const body = {
        orgid: currentOrg,
        name: pa_Org?.orgName,
        service: selectedService,
      };
      await createOrg(body);
    }
    queryClient.invalidateQueries(["org", currentOrg]);
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
      setPayinConfigId(result.response.data.payin_config_id);
    } catch (error) {
      console.error("Error creating payin config:", error);
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
    queryClient.invalidateQueries(["org", currentOrg]);
  };

  const renderPaymentBox = () => {
    if (sessionKey && payinConfigId) {
      return (
        <RainforestPayment
          sessionKey={sessionKey}
          payinConfigId={payinConfigId}
          org={org}
        />
      );
    } else if (isCreatingPayinConfig) {
      return <Spinner label="Loading Payment Settings" />;
    }
  };

  const renderPaymentSettings = () => {
    if (org && Object.keys(org).length > 0 && isOwner) {
      return (
        <>
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">Payment Settings</h3>
            <div className="flex items-center space-x-4">
              {renderSubscriptionCards()}
            </div>
          </div>
          <div className="mb-4">{renderPaymentBox()}</div>
          <ApplicationStatusCard org={org} merchant={merchant} />
        </>
      );
    }
  };

  const renderSubscriptionCards = () => {
    if (subscriptions.length === 0) {
      return (
        <Button
          color="primary"
          onClick={handleCreatePayinConfig}
          isLoading={isCreatingPayinConfig}
        >
          Pay $100.00
        </Button>
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

  const renderOnboarding = () => {
    if (isOnboarding) {
      if (!onboardingSessionKey) {
        fetchSession(
          "merchant-onboarding",
          org.rainforest.merchantid,
          setOnboardingSessionKey
        );
      } else {
        return (
          <>
            <RainforestOnboarding
              sessionKey={onboardingSessionKey || ""}
              merchantId={org.rainforest.merchantid}
              merchantApplicationId={org.rainforest.merchant_application_id}
              onSubmitted={() => {
                setIsOnboarding(false);
                queryClient.invalidateQueries(["org", currentOrg]);
                fetchMerchant();
              }}
            />
          </>
        );
      }
    }
  };

  if (authLoading || orgLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner label="Loading Settings" />
      </div>
    );
  }

  if (orgError) {
    return <div>Error: {orgError.message}</div>;
  }

  return (
    <Card className="p-6 m-4">
      <h2 className="text-2xl font-bold mb-4">Store Settings</h2>
      <div className="mb-4">
        <p>
          <strong>Name:</strong> {org?.name || pa_Org?.orgName || "No Name"}
        </p>
      </div>
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
      {renderOnboarding()}
      <Button
        color="primary"
        onClick={handleSave}
        isLoading={authLoading || orgLoading}
      >
        Save Settings
      </Button>
      {selectedSubscription && (
        <SubscriptionModal
          isOpen={isSubscriptionModalOpen}
          onClose={() => setIsSubscriptionModalOpen(false)}
          subscription={selectedSubscription}
          onUpdate={handleSubscriptionUpdate}
        />
      )}
    </Card>
  );
};

export default Settings;
