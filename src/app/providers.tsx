"use client";

import React, { ReactNode } from "react";
import { AuthProvider } from "@propelauth/nextjs/client";
import "@/styles/globals.css";
import { OrgProvider } from "@/components/context/OrgContext";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "react-query";
import { NavigationProvider } from "@/components/context/NavigationContext";

const auth_url = process.env.NEXT_PUBLIC_AUTH_URL as string;
const queryclient = new QueryClient();

// Utility function to compose providers
const composeProviders =
  (...providers: React.ComponentType<{ children: ReactNode }>[]) =>
  ({ children }: { children: ReactNode }): React.ReactElement =>
    providers.reduceRight(
      (acc, Provider) => <Provider>{acc}</Provider>,
      <>{children}</>
    );

const ComposedProviders = composeProviders(
  NavigationProvider,
  OrgProvider
  // MealsProvider
  // Add more providers here as needed
);

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <AuthProvider authUrl={auth_url}>
        <QueryClientProvider client={queryclient}>
          <NextThemesProvider attribute="class" defaultTheme="dark">
            <ComposedProviders>
              <body>{children}</body>
            </ComposedProviders>
          </NextThemesProvider>
        </QueryClientProvider>
      </AuthProvider>
    </html>
  );
}
