import dotenv from "dotenv";

dotenv.config({
  path: ".env.local",
});

import type { Config } from "drizzle-kit";

export default {
  schema: "./lib/db/schemas/db.schema.ts",
  out: "./lib/db/migrations",
  dialect: "turso",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
} satisfies Config;
