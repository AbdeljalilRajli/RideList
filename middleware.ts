import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ALLOW_INDEXING } from "@/constants/agency";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  if (!ALLOW_INDEXING) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  } else {
    const pathname = request.nextUrl.pathname;
    if (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/signup") ||
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/profile")
    ) {
      response.headers.set("X-Robots-Tag", "noindex, nofollow");
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
