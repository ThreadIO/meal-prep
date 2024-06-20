"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import React from "react";

interface RainforestPaymentProps {
  sessionKey: string;
  payinConfigId: string;
}

const RainforestPayment: React.FC<RainforestPaymentProps> = ({
  sessionKey,
  payinConfigId,
}) => {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchReceiptSession = async (payinId: string) => {
    console.log("Calling the fetchReceiptSession function with pId: ", payinId);
    try {
      const response = await fetch("api/rainforest/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionType: "receipt", payinId: payinId }),
      });
      const result = await response.json();

      console.log("receipt session response: ", result);
      return result.response.data.session_key;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      console.log("Receipt Session key error: ", error);
    }
  };

  useEffect(() => {
    console.log("RF Payment Component: use effect launched");

    const component = document.querySelector("rainforest-payment");

    console.log("Component is null, ", !component, component);
    if (component) {
      console.log("adding listener!");
      component.addEventListener("approved", function (event) {
        const paymentEvent = event as CustomEvent;
        console.log("Here is the payment data after confirmation -- ", event);

        // TODO: Save payin Id somewhere?
        // setPayinId(paymentEvent.detail[0].data.payin_id); // TODO: DOESN'T SAVE TO PAYIN IN TIME... PROBABLY SAVE THIS WITH USER
        console.log("payIn Id is ", paymentEvent.detail[0].data.payin_id);

        const pId = paymentEvent.detail[0]?.data?.payin_id;

        if (pId) {
          fetchReceiptSession(pId)
            .then((receiptSessionKey) => {
              router.push(
                `/checkout/confirmation?payinid=${pId}&sessionkey=${receiptSessionKey}`
              );
            })
            .catch((error) => {
              setError(
                error instanceof Error
                  ? error.message
                  : "Unknown error upon confirmation redirection"
              );
              console.log("Confirmation redirection error: ", error);
            });
        }
      });
    }
  }, [router]);

  // return <div ref={paymentRef} style={{backgroundColor: "white"}}></div>
  return (
    <rainforest-payment
      session-key={sessionKey}
      payin-config-id={payinConfigId}
      allowed-methods={"CARD"}
    ></rainforest-payment>
  );
};

export default RainforestPayment;
