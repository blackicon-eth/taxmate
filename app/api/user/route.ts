import { createUser, getUserFromWalletAddress } from "@/lib/db/queries/user";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const walletAddress = request.headers.get("x-user-address");
  if (!walletAddress) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  // Get the user from the database
  const user = await getUserFromWalletAddress(walletAddress);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user, { status: 200 });
}

export async function POST(request: NextRequest) {
  const walletAddress = request.headers.get("x-user-address");
  if (!walletAddress) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { username } = await request.json();

  if (!username) {
    return NextResponse.json({ error: "Username is required" }, { status: 400 });
  }

  const user = await createUser(walletAddress, username);
  return NextResponse.json(user, { status: 200 });
}
