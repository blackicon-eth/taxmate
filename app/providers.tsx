"use client";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrivyProvider, PrivyClientConfig } from "@privy-io/react-auth";
import { env } from "@/lib/env";

const queryClient = new QueryClient();

const privyConfig = {
  // Customize Privy's appearance in your app
  appearance: {
    theme: "light",
    accentColor: "#676FFF",
    logo: "https://your-logo-url",
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
      <PrivyProvider
        appId={privyAppId}
        clientId={privyClientId}
        config={privyConfig}
      >
        <NuqsAdapter>{children}</NuqsAdapter>
      </PrivyProvider>
    </QueryClientProvider>
  );
};
