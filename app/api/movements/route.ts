import { getMovementsByWalletAddress } from "@/lib/db/queries/movements";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const walletAddress = request.headers.get("x-user-address");
  if (!walletAddress) {
    return NextResponse.json({ error: "Authentication is required" }, { status: 401 });
  }

  try {
    const movements = await getMovementsByWalletAddress(walletAddress);
    return NextResponse.json(movements, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error fetching movements" }, { status: 500 });
  }
}
