import { getTransactionsByWalletAddress } from "@/lib/db/queries/transactions";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  const walletAddress = request.headers.get("x-user-address");
  if (!walletAddress) {
    return NextResponse.json({ error: "Authentication is required" }, { status: 401 });
  }

  try {
    const response = await getTransactionsByWalletAddress(walletAddress);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error fetching transactions" }, { status: 500 });
  }
};
