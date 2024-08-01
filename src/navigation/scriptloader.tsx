// components/ScriptLoader.tsx
"use client";
import React, { useEffect, useState } from "react";
import Script from "next/script";
import { useNavigationContext } from "@/components/context/NavigationContext";

const scriptMap: { [key: string]: string } = {
  settings: "https://static.rainforestpay.com/sandbox.payment.js",
  paymentReport: "https://static.rainforestpay.com/sandbox.merchant.js",
  depositReport: "https://static.rainforestpay.com/sandbox.merchant.js",
  checkout: "https://static.rainforestpay.com/sandbox.merchant.js",
  // Add more mappings as needed
};

const ScriptLoader: React.FC = () => {
  const { currentPage } = useNavigationContext();
  const [scriptSrc, setScriptSrc] = useState<string | null>(null);

  useEffect(() => {
    setScriptSrc(scriptMap[currentPage] || null);
  }, [currentPage]);

  if (!scriptSrc) return null;

  return <Script src={scriptSrc} />;
};

export default ScriptLoader;
