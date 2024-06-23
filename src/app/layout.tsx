"use client";
import React from "react";
import { AuthProvider } from "@propelauth/nextjs/client";
import "@/styles/globals.css";
import { OrgProvider } from "@/components/context/OrgContext";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "react-query";
import { NavigationProvider } from "@/components/context/NavigationContext";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth_url = process.env.NEXT_PUBLIC_AUTH_URL as string;
  const queryclient = new QueryClient();
  return (
    <html lang="en">
      <NavigationProvider>
        <OrgProvider>
          <AuthProvider authUrl={auth_url}>
            <QueryClientProvider client={queryclient}>
              <NextThemesProvider attribute="class" defaultTheme="dark">
                <body>{children}</body>
              </NextThemesProvider>
            </QueryClientProvider>
          </AuthProvider>
        </OrgProvider>
      </NavigationProvider>
    </html>
  );
}
