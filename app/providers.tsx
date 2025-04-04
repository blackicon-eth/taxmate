"use client";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrivyProvider, PrivyClientConfig } from "@privy-io/react-auth";
import { env } from "@/lib/env";
import { NavigationProvider } from "@/components/providers/navigation-provider";
import { UserProvider } from "@/components/providers/user-provider";
import { BrianButtonProvider } from "@/components/providers/brian-button-provider";
import { arbitrumSepolia } from "viem/chains";

import { http } from "wagmi";
import { WagmiProvider, createConfig } from "@privy-io/wagmi";

const queryClient = new QueryClient();

export const wagmiConfig = createConfig({
  chains: [arbitrumSepolia],
  transports: {
    [arbitrumSepolia.id]: http(),
  },
});

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
  defaultChain: arbitrumSepolia,
} as PrivyClientConfig;

const privyAppId = env.NEXT_PUBLIC_PRIVY_APP_ID;
const privyClientId = env.NEXT_PUBLIC_PRIVY_CLIENT_ID;

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <PrivyProvider appId={privyAppId} clientId={privyClientId} config={privyConfig}>
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <NuqsAdapter>
            <NavigationProvider>
              <WagmiProvider config={wagmiConfig} reconnectOnMount={false}>
                <BrianButtonProvider>{children}</BrianButtonProvider>
              </WagmiProvider>
            </NavigationProvider>
          </NuqsAdapter>
        </UserProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
};
