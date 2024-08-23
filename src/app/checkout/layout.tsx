import React from "react";
import Script from "next/script";
import Providers from "@/app/providers";
export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Providers>
        <section>{children}</section>
        <Script src="https://static.rainforestpay.com/sandbox.payment.js" />
      </Providers>
    </>
  );
}
