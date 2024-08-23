import React, { useState } from "react";
import { useOrgContext } from "@/components/context/OrgContext";
import { useUser } from "@propelauth/nextjs/client";
import { Card, RadioGroup, Radio, Image, Input } from "@nextui-org/react";
import { createOrg } from "@/helpers/request";
import { useQueryClient } from "react-query";
import BusinessIcon from "@/components/BusinessIcon";
import StyledButton from "@/components/StyledButton";

const Onboarding = () => {
  const { currentOrg } = useOrgContext();
  const { user } = useUser();
  const [step, setStep] = useState(0);
  const [orgName, setOrgName] = useState("");
  const [selectedService, setSelectedService] = useState("woocommerce");
  const queryClient = useQueryClient();

  const pa_Org = user?.getOrg(currentOrg);

  const handleSave = async () => {
    const body = {
      orgid: currentOrg,
      name: orgName || pa_Org?.orgName,
      service: selectedService,
    };
    await createOrg(body);
    queryClient.invalidateQueries(["org", currentOrg]);
  };

  let steps: { title: string; content: React.JSX.Element }[] = [
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
  ];

  if (!pa_Org?.orgName) {
    steps.push({
      title: "Store Name",
      content: (
        <div>
          <h2 className="text-2xl font-bold mb-4">Name Your Store</h2>
          <Input
            label="Store Name"
            value={orgName}
            defaultValue={pa_Org?.orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder={pa_Org?.orgName || "My Organization"}
          />
        </div>
      ),
    });
  }
  steps.push(
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
      title: "Finish",
      content: (
        <div>
          <h2 className="text-2xl font-bold mb-4">You&apos;re All Set!</h2>
          <p>
            Click Finish to save your settings and start using the platform.
          </p>
        </div>
      ),
    }
  );

  return (
    <Card className="p-6 m-4">
      {steps[step].content}
      <div className="flex justify-between mt-4">
        {step > 0 && (
          <StyledButton text="Previous" onClick={() => setStep(step - 1)} />
        )}
        {step < steps.length - 1 ? (
          <StyledButton text="Next" onClick={() => setStep(step + 1)} />
        ) : (
          <StyledButton text="Finish" onClick={handleSave} />
        )}
      </div>
    </Card>
  );
};

export default Onboarding;
