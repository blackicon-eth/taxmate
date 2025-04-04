import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

// https://env.t3.gg/docs/nextjs
export const env = createEnv({
  server: {
    // TURSO DB
    TURSO_DATABASE_URL: z.string().min(1),
    TURSO_AUTH_TOKEN: z.string().min(1),

    // CRON
    CRON_SECRET: z.string().min(1),

    // PRIVY
    PRIVY_APP_SECRET: z.string().min(1),

    // TOKEN METRICS
    TOKEN_METRICS_API_KEY: z.string().min(1),

    // BRIAN
    BRIAN_API_KEY: z.string().min(1),
  },
  client: {
    // PRIVY
    NEXT_PUBLIC_PRIVY_APP_ID: z.string().min(1),
    NEXT_PUBLIC_PRIVY_CLIENT_ID: z.string().min(1),

    // TOKEN METRICS
    NEXT_PUBLIC_TOKEN_METRICS_ENDPOINT: z.string().min(1),

    // BRIAN
    NEXT_PUBLIC_BRIAN_ENDPOINT: z.string().min(1),

    
    NEXT_PUBLIC_AAVE_POOL_ADDRESS: z.string().min(1),
    NEXT_PUBLIC_USDC_ADDRESS: z.string().min(1),
    NEXT_PUBLIC_WETH_ADDRESS: z.string().min(1),
    NEXT_PUBLIC_ATOKEN_ADDRESS: z.string().min(1),
    NEXT_PUBLIC_VAULT_ADDRESS: z.string().min(1),
  },
  // For Next.js >= 13.4.4, you only need to destructure client variables:
  experimental__runtimeEnv: {
    NEXT_PUBLIC_PRIVY_APP_ID: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
    NEXT_PUBLIC_PRIVY_CLIENT_ID: process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID,
    NEXT_PUBLIC_TOKEN_METRICS_ENDPOINT: process.env.NEXT_PUBLIC_TOKEN_METRICS_ENDPOINT,
    NEXT_PUBLIC_BRIAN_ENDPOINT: process.env.NEXT_PUBLIC_BRIAN_ENDPOINT,
    NEXT_PUBLIC_AAVE_POOL_ADDRESS: process.env.NEXT_PUBLIC_AAVE_POOL_ADDRESS,
    NEXT_PUBLIC_USDC_ADDRESS: process.env.NEXT_PUBLIC_USDC_ADDRESS,
    NEXT_PUBLIC_WETH_ADDRESS: process.env.NEXT_PUBLIC_WETH_ADDRESS,
    NEXT_PUBLIC_ATOKEN_ADDRESS: process.env.NEXT_PUBLIC_ATOKEN_ADDRESS,
    NEXT_PUBLIC_VAULT_ADDRESS: process.env.NEXT_PUBLIC_VAULT_ADDRESS,
  },
});
