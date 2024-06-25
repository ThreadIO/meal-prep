/* eslint-disable no-unused-vars */
import React, { createContext, useContext, ReactNode, useState } from "react";

// Define the shape of your context data
interface OrgContextData {
  currentOrg: string;
  setOrg: (orgId: string) => void;
}

// Create the context
const OrgContext = createContext<OrgContextData | undefined>(undefined);

// Create a provider component to wrap your Next.js app with
export const OrgProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentOrg, setCurrentOrg] = useState<string>("");

  // Define the function to set the currentOrg
  const setOrg = (orgId: string) => {
    setCurrentOrg(orgId);
  };

  // Create the context value
  const contextValue: OrgContextData = {
    currentOrg,
    setOrg,
  };

  // Provide the context value to the wrapped components
  return (
    <OrgContext.Provider value={contextValue}>{children}</OrgContext.Provider>
  );
};

// Create a custom hook to access the context
export const useOrgContext = () => {
  const context = useContext(OrgContext);

  if (!context) {
    throw new Error("useOrgContext must be used within an OrgProvider");
  }

  return context;
};
