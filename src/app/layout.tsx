"use client";
import React from "react";
import { AuthProvider } from "@propelauth/nextjs/client";
import "@/styles/globals.css";
import { OrgProvider } from "@/components/OrgContext";
import { ThemeProvider as NextThemesProvider } from "next-themes";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth_url = process.env.NEXT_PUBLIC_AUTH_URL as string;
  return (
    <html lang="en">
      <OrgProvider>
        <AuthProvider authUrl={auth_url}>
          <NextThemesProvider attribute="class" defaultTheme="dark">
            <body>{children}</body>
          </NextThemesProvider>
        </AuthProvider>
      </OrgProvider>
    </html>
  );
}
