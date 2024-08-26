import React from "react";
import Script from "next/script";

export default function PaymentReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <section>{children}</section>
      <Script
        src={
          process.env.NEXT_PUBLIC_RAINFOREST_JAVASCRIPT_BUNDLE_URL +
          "merchant.js"
        }
      />
    </>
  );
}
