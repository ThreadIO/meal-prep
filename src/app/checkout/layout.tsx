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
        <Script
          src={
            process.env.NEXT_PUBLIC_RAINFOREST_JAVASCRIPT_BUNDLE_URL +
            "payment.js"
          }
        />
      </Providers>
    </>
  );
}
