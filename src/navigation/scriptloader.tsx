// components/ScriptLoader.tsx
"use client";
import React, { useEffect, useState } from "react";
import Script from "next/script";
import { useNavigationContext } from "@/components/context/NavigationContext";

const scriptMap: { [key: string]: string } = {
  settings:
    process.env.NEXT_PUBLIC_RAINFOREST_JAVASCRIPT_BUNDLE_URL + "payment.js",
  paymentReport:
    process.env.NEXT_PUBLIC_RAINFOREST_JAVASCRIPT_BUNDLE_URL + "merchant.js",
  depositReport:
    process.env.NEXT_PUBLIC_RAINFOREST_JAVASCRIPT_BUNDLE_URL + "merchant.js",
  checkout:
    process.env.NEXT_PUBLIC_RAINFOREST_JAVASCRIPT_BUNDLE_URL + "merchant.js",
  onboarding:
    process.env.NEXT_PUBLIC_RAINFOREST_JAVASCRIPT_BUNDLE_URL + "merchant.js",
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
