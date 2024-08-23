import React, { createContext, useContext, ReactNode, useState } from "react";
import { useQuery } from "react-query";
import { getData } from "@/helpers/frontend";

interface OrgContextData {
  currentOrg: string;
  // eslint-disable-next-line no-unused-vars
  setOrg: (orgId: string) => void;
  org: any;
  isLoading: boolean;
  error: any;
}

const OrgContext = createContext<OrgContextData | undefined>(undefined);

export const OrgProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentOrg, setCurrentOrg] = useState<string>("");

  const fetchOrgData = async () => {
    if (!currentOrg) return null;
    const url = `/api/org/propelauth/${currentOrg}`;
    const method = "GET";
    const headers = {
      "Content-Type": "application/json",
    };
    return new Promise((resolve, reject) => {
      getData("org", url, method, headers, resolve, reject, () => {});
    });
  };

  const {
    data: org,
    isLoading,
    error,
  } = useQuery(["org", currentOrg], fetchOrgData, {
    enabled: !!currentOrg,
  });

  const setOrg = (orgId: string) => {
    setCurrentOrg(orgId);
  };

  const contextValue: OrgContextData = {
    currentOrg,
    setOrg,
    org,
    isLoading,
    error,
  };

  return (
    <OrgContext.Provider value={contextValue}>{children}</OrgContext.Provider>
  );
};

export const useOrgContext = () => {
  const context = useContext(OrgContext);

  if (!context) {
    throw new Error("useOrgContext must be used within an OrgProvider");
  }

  return context;
};
