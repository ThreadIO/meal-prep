"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import React from "react";
import { useUser } from "@propelauth/nextjs/client";
import { Spinner } from "@nextui-org/react";
import { SignupAndLoginButtons } from "@/components/SignupAndLoginButtons";
import RainforestPayment from "@/components/Payment/RainforestPayment";

export default function Checkout() {
  const { loading, isLoggedIn } = useUser();
  const [sessionKey, setSessionKey] = useState<string | null>(null);
  const [payinConfigId, setPayinConfigId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  if (isLoggedIn) {
    if (error) {
      return <div> Error: {error} </div>;
    }
    // If we are checking out
    else if (sessionKey && payinConfigId) {
      return (
        <div style={{ display: "flex", height: "100vh" }}>
          <Sidebar />
          <div className="flex-1">
            <Navbar />
            <h1>Payment Page</h1>
            <RainforestPayment
              sessionKey={sessionKey}
              payinConfigId={payinConfigId}
            ></RainforestPayment>
          </div>
        </div>
      );
    } else {
      return <> Unexpected </>;
    }
  } else if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <Spinner label="Loading Page" />
        </div>
      </div>
    );
  } else {
    return <SignupAndLoginButtons />;
  }
}
