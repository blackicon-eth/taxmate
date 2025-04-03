import { createUser, getUserFromWalletAddress } from "@/lib/db/queries/user";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  const walletAddress = request.headers.get("x-user-address");
  if (!walletAddress) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  // Get the user from the database
  let user;
  try {
    user = await getUserFromWalletAddress(walletAddress);
  } catch (error) {
    return NextResponse.json({ error: "Failed to get user" }, { status: 500 });
  }

  if (!user) {
    try {
      //Create a new user
      const newUser = await createUser(walletAddress);
      return NextResponse.json(newUser, { status: 200 });
    } catch (error) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }
  }

  return NextResponse.json(user, { status: 200 });
};
