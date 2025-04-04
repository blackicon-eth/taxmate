import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "./lib/privy";

export const config = {
  matcher: ["/api/:path*", "/((?!_next/static|_next/image|favicon.ico|images).*)"],
};

export default async function middleware(req: NextRequest) {
  if (
    req.nextUrl.pathname.startsWith("/api/token-metrics") ||
    req.nextUrl.pathname.startsWith("/api/free")
  ) {
    return NextResponse.next();
  }

  const isApiRoute = req.nextUrl.pathname.startsWith("/api");
  const isBaseRoute = req.nextUrl.pathname === "/";

  // Get the Privy token from the headers
  const authToken = req.cookies.get("privy-id-token")?.value;

  if (!authToken) {
    if (isApiRoute) {
      return NextResponse.json({ error: "Authentication token is required" }, { status: 401 });
    }
    return isBaseRoute ? NextResponse.next() : NextResponse.redirect(new URL("/", req.url));
  }

  // Verify the Privy token
  const { isValid, user } = await verifyAuthToken(authToken);

  if (!isValid) {
    if (isApiRoute) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    return isBaseRoute ? NextResponse.next() : NextResponse.redirect(new URL("/", req.url));
  }

  if (isApiRoute) {
    // Get the Privy embedded wallet address
    const address = user?.wallet?.address;

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-address", address! as string);

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  return !isBaseRoute ? NextResponse.next() : NextResponse.redirect(new URL("/simple", req.url));
}
