import React, { createContext, useContext, ReactNode, useState } from "react";

// Define the shape of your context data
interface NavigationContextData {
  currentPage: string;
  // eslint-disable-next-line no-unused-vars
  setCurrentPage: (page: string) => void;
}

// Create the context
const NavigationContext = createContext<NavigationContextData | undefined>(
  undefined
);

// Create a provider component to wrap your Next.js app with
export const NavigationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentPage, setCurrentPage] = useState<string>("/");

  // Define the function to set the currentPage
  const setPage = (page: string) => {
    setCurrentPage(page);
  };

  // Create the context value
  const contextValue: NavigationContextData = {
    currentPage,
    setCurrentPage: setPage,
  };

  // Provide the context value to the wrapped components
  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
};

// Create a custom hook to access the context
export const useNavigationContext = () => {
  const context = useContext(NavigationContext);

  if (!context) {
    throw new Error(
      "useNavigationContext must be used within a NavigationProvider"
    );
  }

  return context;
};
