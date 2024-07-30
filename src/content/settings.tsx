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

const Settings = () => {
  const { loading, isLoggedIn, user } = useUser();
  const { currentOrg } = useOrgContext();
  const [selectedService, setSelectedService] = useState("woocommerce");
  const [org, setOrg] = useState<any>();
  const [error, setError] = useState<string>("");
  const [orgLoading, setOrgLoading] = useState<boolean>(false);
  const [sessionKey, setSessionKey] = useState<string | null>(null);
  const [payinConfigId, setPayinConfigId] = useState<string | null>(null);

  const validOptions = ["woocommerce"];
  const isInvalid = !validOptions.includes(selectedService);

  useEffect(() => {
    if (isLoggedIn && !loading && !orgLoading && currentOrg) {
      getOrg(currentOrg);
    }
  }, [currentOrg, isLoggedIn, loading]);

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

    const createPayinConfig = async () => {
      try {
        const response = await fetch("api/rainforest/create-payin-config", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const result = await response.json();

        console.log("Got the payin config: ", result);

        const payinConfigId = result.response.data.payin_config_id;
        setPayinConfigId(payinConfigId);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unknown error occurre for grabbing payin config"
        );
      }
    };

    if (!sessionKey) {
      fetchSession();
    }

    if (!payinConfigId) {
      createPayinConfig();
    }
  }, [sessionKey, payinConfigId]);

  function getPropelAuthOrg(orgId?: string) {
    if (!orgId) {
      return null;
    }
    return user?.getOrg(orgId);
  }

  const getOrg = async (orgId: string) => {
    const url = `/api/propelauth/org/${orgId}`;
    const method = "GET";
    const headers = {
      "Content-Type": "application/json",
    };
    getData("org", url, method, headers, setOrg, setError, setOrgLoading);
  };

  const handleSave = async () => {
    // Placeholder function for saving settings
    setOrgLoading(true);
    console.log("Org: ", org);
    if (org && Object.keys(org).length > 0) {
      // Org Exists, patch it
      await patchOrg(org.id, { service: selectedService });
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
    // Add your save logic here
  };

  const renderPaymentBox = () => {
    if (sessionKey && payinConfigId) {
      return (
        <RainforestPayment
          sessionKey={sessionKey}
          payinConfigId={payinConfigId}
        ></RainforestPayment>
      );
    } else {
      return <Spinner label="Loading Payment Settings" />;
    }
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
          <div className="mb-4">{renderPaymentBox()}</div>
          <div className="mb-4">
            {/* <h3 className="text-xl font-semibold mb-2">Additional Settings</h3>
            <div className="flex items-center justify-between">
              <span>Enable notifications</span>
              <Switch />
            </div> */}
          </div>
          <Button color="primary" onClick={handleSave} isLoading={orgLoading}>
            Save Settings
          </Button>
        </Card>
      );
    }
  };
  return renderSettingPage();
};

export default Settings;
