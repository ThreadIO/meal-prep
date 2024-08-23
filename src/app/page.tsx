"use client";
import React from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { useUser } from "@propelauth/nextjs/client";
import { SignupAndLoginButtons } from "@/components/SignupAndLoginButtons";
import { Spinner } from "@nextui-org/react";
import SwitchBoard from "@/navigation/switchboard";
import ScriptLoader from "@/navigation/scriptloader";
import { useOrgContext } from "@/components/context/OrgContext";
import Onboarding from "@/components/Onboarding";

const MainPage = () => {
  const { loading, isLoggedIn } = useUser();
  const { org, isLoading: orgLoading } = useOrgContext();

  if (loading || orgLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner label="Loading Page" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return <SignupAndLoginButtons />;
  }

  console.log("org", org);

  if (!org || Object.keys(org).length === 0) {
    return <Onboarding />;
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Navbar />
        <SwitchBoard />
        <ScriptLoader />
      </div>
    </div>
  );
};

export default MainPage;
