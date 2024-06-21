import React from "react";
import Script from "next/script";

export default function DepositReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <section>{children}</section>
      <Script src="https://static.rainforestpay.com/sandbox.merchant.js" />
    </>
  );
}
