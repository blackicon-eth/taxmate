import { eq } from "drizzle-orm";
import { db } from "..";
import { userTable } from "../schemas/db.schema";

/**
 * Create a new user
 * @param walletAddress - The wallet address of the user
 * @param username - The username of the user (optional)
 * @returns The created user
 */
export const createUser = async (walletAddress: string, username?: string) => {
  const user = await db.insert(userTable).values({
    walletAddress,
    username: username || null,
  });
  return user;
};

/**
 * Get a user by their wallet address
 * @param walletAddress - The wallet address of the user
 * @returns The user
 */
export const getUserFromWalletAddress = async (walletAddress: string) => {
  const user = await db.query.userTable.findFirst({
    where: eq(userTable.walletAddress, walletAddress),
  });
  return user;
};
