import { and, eq } from "drizzle-orm";
import { movementsTable } from "../schemas/db.schema";
import { db } from "..";

/**
 * Get all movements by wallet address
 * @param walletAddress - The wallet address to get movements for
 * @returns All movements for the given wallet address
 */
export const getMovementsByWalletAddress = async (walletAddress: string) => {
  const movements = await db.query.movementsTable.findMany({
    where: eq(movementsTable.walletAddress, walletAddress),
  });

  return movements;
};

/**
 * Get all movements by wallet address and protocol
 * @param walletAddress - The wallet address to get movements for
 * @param protocol - The protocol to get movements for
 * @returns All movements for the given wallet address and protocol
 */
export const getAllMovementsByWalletAddressAndProtocol = async (
  walletAddress: string,
  protocol: string
) => {
  const movements = await db.query.movementsTable.findMany({
    where: and(
      eq(movementsTable.walletAddress, walletAddress),
      eq(movementsTable.protocol, protocol)
    ),
  });

  return movements;
};

/**
 * Create a movement
 * @param walletAddress - The wallet address to create the movement for
 * @param amount - The amount of the movement
 * @param isBuy - Whether the movement is a buy or a sell
 * @param protocol - The protocol to create the movement for
 * @returns The created movement
 */
export const createMovement = async (
  walletAddress: string,
  amount: number,
  isBuy: boolean,
  protocol: string
) => {
  const movement = await db.insert(movementsTable).values({
    walletAddress,
    amount,
    isBuy: isBuy ? 1 : 0,
    protocol,
  });

  return movement;
};
