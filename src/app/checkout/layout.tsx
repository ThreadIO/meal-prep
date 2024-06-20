import React from "react";
import Script from "next/script";

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <section>{children}</section>
      <Script src="https://static.rainforestpay.com/sandbox.payment.js" />
    </>
  );
}
