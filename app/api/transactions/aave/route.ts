import { getTransactionsByWalletAddressAndProtocol } from "@/lib/db/queries/transactions";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  const walletAddress = request.headers.get("x-user-address");
  if (!walletAddress) {
    return NextResponse.json({ error: "Authentication is required" }, { status: 401 });
  }

  try {
    const transactions = await getTransactionsByWalletAddressAndProtocol(walletAddress, "AAVE");
    return NextResponse.json(transactions, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error fetching transactions" }, { status: 500 });
  }
};
