"use client";
import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PaymentConfirmation } from "@/components/Payment/PaymentConfirmation";

const Confirmation = () => {
  const searchParams = useSearchParams();
  const payinId = searchParams.get("payinid");
  const receiptSessionKey = searchParams.get("sessionkey");

  // Make sure I'm pulling in the values from the Router.push() in Rainforest payment component
  useEffect(() => {
    console.log("PayinId: ", payinId);
    console.log("SessionKey: ", receiptSessionKey);
  });

  return (
    <div>
      <h1>Payment Confirmed</h1>
      {payinId && receiptSessionKey ? (
        <>
          <p>Your payment was successful. Payin Id: {payinId}</p>
          <PaymentConfirmation
            sessionKey={receiptSessionKey}
            payinId={payinId}
          ></PaymentConfirmation>
        </>
      ) : (
        <p>No Payin Id or SessionKey found</p>
      )}
    </div>
  );
};

export default Confirmation;
