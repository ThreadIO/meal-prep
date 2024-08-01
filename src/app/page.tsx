"use client";
import React from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { useUser } from "@propelauth/nextjs/client";
import { SignupAndLoginButtons } from "@/components/SignupAndLoginButtons";
import { Spinner } from "@nextui-org/react";
import SwitchBoard from "@/navigation/switchboard";
import ScriptLoader from "@/navigation/scriptloader";

const MainPage = () => {
  // For now, it just shows the orders page
  const { loading, isLoggedIn } = useUser();

  if (isLoggedIn) {
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
  } else if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner label="Loading Page" />
      </div>
    );
  } else {
    return <SignupAndLoginButtons />;
  }
};

export default MainPage;
