"use client";

import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { useUser } from "@propelauth/nextjs/client";
import { SignupAndLoginButtons } from "@/components/SignupAndLoginButtons";
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

const Settings = () => {
  const { loading, isLoggedIn, user } = useUser();
  const { currentOrg } = useOrgContext();
  const [selectedService, setSelectedService] = useState("woocommerce");
  const [org, setOrg] = useState<any>();
  const [error, setError] = useState<string>("");
  const [orgLoading, setOrgLoading] = useState<boolean>(false);
  const validOptions = ["woocommerce"];
  const isInvalid = !validOptions.includes(selectedService);

  useEffect(() => {
    if (isLoggedIn && !loading && !orgLoading && currentOrg) {
      getOrg(currentOrg);
    }
  }, [currentOrg, isLoggedIn, loading]);

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

  if (isLoggedIn) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <Navbar />
          {renderSettingPage()}
        </div>
      </div>
    );
  } else if (loading || orgLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner label="Loading Page" />
      </div>
    );
  } else {
    return <SignupAndLoginButtons />;
  }
};

export default Settings;
