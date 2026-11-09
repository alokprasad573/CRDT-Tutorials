import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/register"];
const API_PATHS = ["/api"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow API routes and static assets
  if (API_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // If accessing public paths, allow (session cookie will be validated by backend)
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // For protected routes, check for session cookie
  const sessionCookie = request.cookies.get("collabnote.sid");
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/documents/:path*"],
};
