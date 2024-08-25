import React, { useState, useEffect } from "react";
import { useOrgContext } from "@/components/context/OrgContext";
import { useUser } from "@propelauth/nextjs/client";
import { Card, RadioGroup, Radio, Image, Spinner } from "@nextui-org/react";
import { createOrg } from "@/helpers/request";
import { useQueryClient } from "react-query";
import BusinessIcon from "@/components/BusinessIcon";
import StyledButton from "@/components/StyledButton";
import { useTheme } from "next-themes";
import RainforestOnboarding from "@/components/Rainforest/RainforestOnboarding";

const Onboarding = () => {
  const { currentOrg, setOrg } = useOrgContext();
  const { setTheme } = useTheme();
  const { user } = useUser();
  const [step, setStep] = useState(0);
  const [orgName, setOrgName] = useState("");
  const [selectedService, setSelectedService] = useState("woocommerce");
  const [sessionKey, setSessionKey] = useState("");
  const [merchantId, setMerchantId] = useState("");
  const [merchantApplicationId, setMerchantApplicationId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState("");
  const queryClient = useQueryClient();

  const pa_Org = user?.getOrg(currentOrg);

  useEffect(() => {
    if (pa_Org?.orgName) {
      setOrgName(pa_Org.orgName);
      setTheme("light");
    }
  }, [pa_Org]);

  useEffect(() => {
    if (merchantId) {
      checkApplicationStatus();
    }
  }, [merchantId]);

  const checkApplicationStatus = async () => {
    try {
      const response = await fetch("/api/rainforest/get-merchants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchant_id: merchantId }),
      });
      const data = await response.json();
      if (data.success && data.data.length > 0) {
        const merchant = data.data[0];
        setApplicationStatus(merchant.latest_merchant_application.status);
        if (merchant.latest_merchant_application.status === "PROCESSING") {
          setApplicationSubmitted(true);
        }
      }
    } catch (error) {
      console.error("Error checking application status:", error);
    }
  };

  const createMerchant = async () => {
    setIsLoading(true);
    try {
      const existingMerchants = await fetch("/api/rainforest/get-merchants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: orgName }),
      });
      const existingMerchantsData = await existingMerchants.json();
      console.log("Existing Merchants: ", existingMerchantsData);
      if (
        existingMerchantsData.success &&
        existingMerchantsData.data.length > 0
      ) {
        const existingMerchant = existingMerchantsData.data[0];
        setMerchantId(existingMerchant.merchant_id);
        setMerchantApplicationId(
          existingMerchant.latest_merchant_application.merchant_application_id
        );
      } else {
        const newMerchant = await fetch("/api/rainforest/merchant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: orgName }),
        });
        const newMerchantData = await newMerchant.json();

        if (newMerchantData.success) {
          setMerchantId(newMerchantData.response.merchant_id);
          setMerchantApplicationId(
            newMerchantData.response.merchant_application_id
          );
        } else {
          throw new Error("Failed to create merchant");
        }
      }

      const sessionResponse = await fetch("/api/rainforest/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionType: "merchant-onboarding",
          merchantId: merchantId,
        }),
      });
      const sessionData = await sessionResponse.json();

      if (sessionData.success) {
        setSessionKey(sessionData.response.data.session_key);
      } else {
        throw new Error("Failed to fetch session key");
      }

      setIsLoading(false);
      setStep(step + 1);
    } catch (error) {
      console.error("Error in merchant creation process:", error);
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    const body = {
      orgid: currentOrg,
      name: orgName || pa_Org?.orgName,
      service: selectedService,
      rainforest: {
        merchantid: merchantId,
        merchant_application_id: merchantApplicationId,
      },
    };
    const savedOrg = await createOrg(body);
    setOrg(savedOrg);
    queryClient.invalidateQueries(["org", currentOrg]);
  };

  const handleRainforestOnboardingComplete = () => {
    setApplicationSubmitted(true);
    checkApplicationStatus();
  };

  const handleNextStep = () => {
    if (step === 1) {
      createMerchant();
    } else {
      setStep(step + 1);
    }
  };

  const app_finished =
    applicationSubmitted || applicationStatus === "PROCESSING";

  const scrollableContainerStyle: React.CSSProperties = {
    height: "calc(100vh - 200px)",
    overflowY: "scroll",
    padding: "20px",
    border: `1px solid var(--border-color)`,
    borderRadius: "8px",
    backgroundColor: "var(--background-color)",
  };

  let steps = [
    {
      title: "Welcome",
      content: (
        <div className="flex flex-col items-center">
          <BusinessIcon width={100} height={100} alt={"Thread Icon"} />
          <h2 className="mt-4 text-center text-2xl font-bold mb-4">Welcome!</h2>
          <p>Let&apos;s set up your store. Click next to begin.</p>
        </div>
      ),
    },
    {
      title: "Select Service",
      content: (
        <div>
          <h2 className="text-2xl font-bold mb-4">Select Your Service</h2>
          <RadioGroup
            value={selectedService}
            onValueChange={setSelectedService}
            orientation="horizontal"
          >
            <Radio value="woocommerce">
              <div className="flex items-center">
                <Image
                  alt="Woocommerce Icon"
                  src="https://upload.wikimedia.org/wikipedia/commons/2/2a/WooCommerce_logo.svg"
                  width={30}
                />
                <span className="ml-2">WooCommerce</span>
              </div>
            </Radio>
          </RadioGroup>
        </div>
      ),
    },
    {
      title: "Rainforest Onboarding",
      content: (
        <div>
          <h2 className="text-2xl font-bold mb-4">
            Complete Rainforest Onboarding
          </h2>
          {sessionKey && merchantId && merchantApplicationId ? (
            app_finished ? (
              <Card className="p-4">
                <p className="text-lg font-semibold">
                  Your application has been submitted and is being processed.
                </p>
                <p className="mt-2">
                  We&apos;ll notify you once the review is complete. You can
                  proceed to the next step.
                </p>
              </Card>
            ) : (
              <div style={scrollableContainerStyle}>
                <RainforestOnboarding
                  sessionKey={sessionKey}
                  merchantId={merchantId}
                  merchantApplicationId={merchantApplicationId}
                  onSubmitted={handleRainforestOnboardingComplete}
                />
              </div>
            )
          ) : (
            <Spinner label="Loading Rainforest Onboarding..." />
          )}
        </div>
      ),
    },
    {
      title: "Finish",
      content: (
        <div>
          <h2 className="text-2xl font-bold mb-4">You&apos;re All Set!</h2>
          <p>
            Click Finish to save your settings and start using the platform.
          </p>
        </div>
      ),
    },
  ];

  return (
    <Card className="p-6 m-4">
      {steps[step].content}
      <div className="flex justify-between mt-4">
        {step > 0 && (
          <StyledButton
            text="Previous"
            onClick={() => setStep(step - 1)}
            disabled={isLoading}
          />
        )}
        {step < steps.length - 1 && (step !== 2 || app_finished) && (
          <StyledButton
            text="Next"
            onClick={handleNextStep}
            disabled={isLoading}
          />
        )}
        {step === steps.length - 1 && (
          <StyledButton
            text="Finish"
            onClick={handleSave}
            disabled={isLoading}
          />
        )}
      </div>
    </Card>
  );
};

export default Onboarding;
