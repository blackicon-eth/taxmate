import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { v4 as uuidv4 } from "uuid";

/**
 * User table
 */
export const userTable = sqliteTable("user", {
  walletAddress: text("wallet_address").primaryKey(),
  username: text("username"),
  pfp: text("pfp"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
});

export type DbUser = typeof userTable.$inferSelect;

/**
 * Transactions table
 * This table is used to store all transactions for a user
 */
export const transactionsTable = sqliteTable("transactions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  walletAddress: text("wallet_address").notNull(),
  tokenSymbol: text("token_symbol").notNull(),
  protocol: text("protocol").notNull(),
  amountUSD: integer("amount_usd").notNull(),
  amountEUR: integer("amount_eur").notNull(),
  change24h: integer("change_24h").notNull(),
  eurDailyProfit: integer("eur_daily_profit").notNull(),
  usdToEurRate: integer("usd_to_eur_rate").notNull(),
  chain: text("chain").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
});

export type Transaction = typeof transactionsTable.$inferSelect;

/**
 * Movements table
 * This table is used to store all movements for a user
 */
export const movementsTable = sqliteTable("movements", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  walletAddress: text("wallet_address").notNull(),
  isBuy: integer("is_buy").notNull(), // 1 for buy, 0 for sell
  amount: integer("amount").notNull(),
  protocol: text("protocol"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export type Movement = typeof movementsTable.$inferSelect;
