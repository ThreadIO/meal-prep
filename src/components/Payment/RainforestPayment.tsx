"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import React from "react";
import { createSubscription } from "@/helpers/request";

interface RainforestPaymentProps {
  sessionKey: string;
  payinConfigId: string;
  org?: any;
}

const RainforestPayment: React.FC<RainforestPaymentProps> = ({
  sessionKey,
  payinConfigId,
  org,
}) => {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const listenerAdded = useRef(false);

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
    if (component && !listenerAdded.current) {
      console.log("adding listener!");

      const handleApproved = async function (event: Event) {
        const paymentEvent = event as CustomEvent;
        console.log("Here is the payment data after confirmation -- ", event);
        console.log("payIn Id is ", paymentEvent.detail[0].data.payin_id);
        console.log(
          "Payment Method Id is ",
          paymentEvent.detail[0].data.payment_method_id
        );
        const pId = paymentEvent.detail[0]?.data?.payin_id;
        const paymentMethodId = paymentEvent.detail[0]?.data?.payment_method_id;
        const amount = paymentEvent.detail[0]?.data?.amount;
        const currency = paymentEvent.detail[0]?.data?.currency_code;
        if (pId) {
          try {
            if (org) {
              await createSubscription({
                orgid: org._id,
                paymentMethodId: paymentMethodId,
                amount: amount,
                currency: currency,
              });
            }
            const receiptSessionKey = await fetchReceiptSession(pId);
            router.push(
              `/checkout/confirmation?payinid=${pId}&sessionkey=${receiptSessionKey}`
            );
          } catch (error) {
            setError(
              error instanceof Error
                ? error.message
                : "Unknown error upon confirmation redirection"
            );
            console.log("Confirmation redirection error: ", error);
          }
        }
      };

      component.addEventListener("approved", handleApproved);
      listenerAdded.current = true;

      // Cleanup function
      return () => {
        component.removeEventListener("approved", handleApproved);
        listenerAdded.current = false;
      };
    }
  }, [router, org._id]);

  return (
    <rainforest-payment
      session-key={sessionKey}
      payin-config-id={payinConfigId}
      allowed-methods={"CARD"}
    ></rainforest-payment>
  );
};

export default RainforestPayment;
