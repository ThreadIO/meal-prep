"use client";
import React, { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const PaymentConfirmation = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const payinId = searchParams.get("payinid");
  const receiptSessionKey = searchParams.get("sessionkey");

  useEffect(() => {
    console.log("PayinId: ", payinId);
    console.log("SessionKey: ", receiptSessionKey);
  }, [payinId, receiptSessionKey]);

  const handleBackClick = () => {
    router.push("/"); // Assuming '/' is your main page
  };

  return (
    <div>
      <h1>Payment Confirmed</h1>
      {payinId && receiptSessionKey ? (
        <>
          <p>Your payment was successful. Payin Id: {payinId}</p>
          <rainforest-payin-receipt
            session-key={receiptSessionKey}
            payin-id={payinId}
          ></rainforest-payin-receipt>
        </>
      ) : (
        <p>No Payin Id or SessionKey found</p>
      )}
      <button onClick={handleBackClick}>Back to Main Page</button>
    </div>
  );
};

const Confirmation = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentConfirmation />
    </Suspense>
  );
};

export default Confirmation;
