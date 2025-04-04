import { eq, and } from "drizzle-orm";
import { transactionsTable } from "../schemas/db.schema";
import { db } from "..";

/**
 * Get all AAVE transactions
 * @returns All AAVE transactions
 */
export const getAllAAVETransactions = async () => {
  const transactions = await db
    .select()
    .from(transactionsTable)
    .where(eq(transactionsTable.protocol, "AAVE"));
  return transactions;
};

/**
 * Get transactions by wallet address
 * @param walletAddress - The wallet address to get transactions for
 * @returns Transactions by wallet address
 */
export const getTransactionsByWalletAddress = async (walletAddress: string) => {
  const transactions = await db
    .select()
    .from(transactionsTable)
    .where(eq(transactionsTable.walletAddress, walletAddress));
  return transactions;
};

/**
 * Get transactions by wallet address and protocol
 * @param walletAddress - The wallet address to get transactions for
 * @param protocol - The protocol to get transactions for
 * @returns Transactions by wallet address and protocol
 */
export const getTransactionsByWalletAddressAndProtocol = async (
  walletAddress: string,
  protocol: string
) => {
  const transactions = await db
    .select()
    .from(transactionsTable)
    .where(
      and(
        eq(transactionsTable.walletAddress, walletAddress),
        eq(transactionsTable.protocol, protocol)
      )
    );
  return transactions;
};
