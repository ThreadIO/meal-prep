"use client";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { SignupAndLoginButtons } from "@/components/SignupAndLoginButtons";
import { Spinner } from "@nextui-org/react";
import { useUser } from "@propelauth/nextjs/client";
import { useEffect, useState } from "react";

const RainforestPaymentReport = () => {
  const [sessionKey, setSessionKey] = useState<string | null>(null);
  const [mId] = useState<string>("sbx_mid_2g6zrrR2AgUpICJFqWIc56FRu3Q");

  const fetchSession = async () => {
    const response = await fetch("api/rainforest/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sessionType: "merchant-payment-report", merchantId: mId }),
    });
    const result = await response.json();
    console.log("Got session key for payment: ", result);

    const sessionKey = result.response.data.session_key;
    setSessionKey(sessionKey);
  };

  // TODO: Only load if the sessionId and mId are available.. Maybe Suspense?

  useEffect(() => {
    // TODO: Get the merchantId from DB for this store
    // const merchantId = getFromMongo();

    if (mId) {
      fetchSession();
      console.log("Merchant session key: ", sessionKey);
    }
  }, []);

  const dataFilters = JSON.stringify({ merchant_id: mId });
  const tableName = "Payment Report";

  return (
    <div>
      {mId && sessionKey ? (
        <rainforest-payment-report
          session-key={sessionKey}
          display-header={tableName}
          data-filters={dataFilters}
        ></rainforest-payment-report>
      ) : (
        <p>No Merchant Id or SessionKey found</p>
      )}
    </div>
  );
};

export default function PaymentReport() {
  const { loading, isLoggedIn } = useUser();

  if (isLoggedIn) {
    return (
      <div style={{ display: "flex", height: "100vh" }}>
        <Sidebar />
        <div
          className="flex-1"
          style={{ display: "flex", flexDirection: "column" }}
        >
          <Navbar />
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <RainforestPaymentReport />
          </div>
        </div>
      </div>
    );
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
