"use client";
import React from "react";

interface PaymentConfirmationProps {
  sessionKey: string;
  payinId: string;
}

export const PaymentConfirmation: React.FC<PaymentConfirmationProps> = ({
  sessionKey,
  payinId,
}) => {
  return (
    <rainforest-payin-receipt
      session-key={sessionKey}
      payin-id={payinId}
    ></rainforest-payin-receipt>
  );
};
