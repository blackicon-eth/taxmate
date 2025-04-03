import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * User table
 */
export const userTable = sqliteTable("user", {
  walletAddress: text("wallet_address").primaryKey(),
  username: text("username"),
  pfp: text("pfp"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
});

export type DbUser = typeof userTable.$inferSelect;

/**
 * Transactions table
 * This table is used to store all transactions for a user
 */
export const transactionsTable = sqliteTable("transactions", {
  txHash: text("tx_hash").primaryKey(),
  type: text("type").notNull(),
  amount: integer("amount").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
});

export type Transaction = typeof transactionsTable.$inferSelect;
