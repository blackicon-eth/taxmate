import {
  createMovement,
  getAllMovementsByWalletAddressAndProtocol,
} from "@/lib/db/queries/movements";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const walletAddress = request.headers.get("x-user-address");
  if (!walletAddress) {
    return NextResponse.json({ error: "Authentication is required" }, { status: 401 });
  }

  try {
    const movements = await getAllMovementsByWalletAddressAndProtocol(walletAddress, "VAULT");
    return NextResponse.json(movements, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error fetching movements" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const walletAddress = request.headers.get("x-user-address");
  if (!walletAddress) {
    return NextResponse.json({ error: "Authentication is required" }, { status: 401 });
  }

  const body = await request.json();
  const { amount, isBuy } = body;

  if (!amount) {
    return NextResponse.json({ error: "Amount is required" }, { status: 400 });
  }

  if (amount <= 0) {
    return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 });
  }

  try {
    const movement = await createMovement(walletAddress, amount, isBuy, "VAULT");
    return NextResponse.json(movement, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error creating movement" }, { status: 500 });
  }
}
