"use client";
import React, { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

const PaymentConfirmation = () => {
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
          <p>Your payment was successful. Payin Id: </p>
          <rainforest-payin-receipt
            session-key={receiptSessionKey}
            payin-id={payinId}
          ></rainforest-payin-receipt>
        </>
      ) : (
        <p>No Payin Id or SessionKey found</p>
      )}
    </div>
  );
};

const Confirmation = () => {
  return (
    <Suspense>
      <PaymentConfirmation></PaymentConfirmation>
    </Suspense>
  );
};

export default Confirmation;
