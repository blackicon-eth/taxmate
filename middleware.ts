import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "./lib/privy";

export const config = {
  matcher: ["/api/:path*", "/((?!_next/static|_next/image|favicon.ico).*)"],
};

export default async function middleware(req: NextRequest) {
  // Skip auth check for free access routes
  if (req.nextUrl.pathname === "/api/free") {
    return NextResponse.next();
  }

  // Get the Privy token from the headers
  const authToken = req.headers.get("Authorization");

  if (!authToken) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  console.log("authToken", authToken);

  // Verify the Privy token
  const { isValid, user } = await verifyAuthToken(authToken);
  if (!isValid) {
    console.error("\nAuthentication failed because jwt is not valid\n");
    return NextResponse.json(
      { error: "Authentication failed" },
      {
        status: 401,
      }
    );
  }

  // Get the Privy embedded wallet address
  const address = user?.wallet?.address;
  return NextResponse.next().headers.set("x-user-address", address!);
}
