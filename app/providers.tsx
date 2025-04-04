"use client";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrivyProvider, PrivyClientConfig } from "@privy-io/react-auth";
import { env } from "@/lib/env";
import { NavigationProvider } from "@/components/providers/navigation-provider";
import { UserProvider } from "@/components/providers/user-provider";
import { BrianButtonProvider } from "@/components/providers/brian-button-provider";

const queryClient = new QueryClient();

const privyConfig = {
  // Customize Privy's appearance in your app
  appearance: {
    theme: "dark",
    accentColor: "#2596be",
    logo: "/images/taxmate-logo-no-bg.png",
  },
  // Create embedded wallets for users who don't have a wallet
  embeddedWallets: {
    createOnLogin: "users-without-wallets",
  },
} as PrivyClientConfig;

const privyAppId = env.NEXT_PUBLIC_PRIVY_APP_ID;
const privyClientId = env.NEXT_PUBLIC_PRIVY_CLIENT_ID;

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <PrivyProvider appId={privyAppId} clientId={privyClientId} config={privyConfig}>
        <UserProvider>
          <NuqsAdapter>
            <NavigationProvider>
              <BrianButtonProvider>{children}</BrianButtonProvider>
            </NavigationProvider>
          </NuqsAdapter>
        </UserProvider>
      </PrivyProvider>
    </QueryClientProvider>
  );
};
