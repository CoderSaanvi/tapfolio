import { NextResponse, type NextRequest } from "next/server";

/**
 * Basic-auth gate for the owner's pages (share screen, activity log,
 * conversations, reading events). Recruiter-facing /c/* and event POSTs stay public. Disabled when
 * OWNER_PASSWORD is unset so local demos just work.
 */
export function middleware(req: NextRequest) {
  const password = process.env.OWNER_PASSWORD;
  if (!password) return NextResponse.next();
  if (req.nextUrl.pathname === "/api/events" && req.method === "POST") return NextResponse.next();

  const header = req.headers.get("authorization") ?? "";
  const [scheme, encoded] = header.split(" ");
  if (scheme === "Basic" && encoded) {
    try {
      const [, pass] = atob(encoded).split(":");
      if (pass === password) return NextResponse.next();
    } catch {
      // Malformed header falls through to the challenge.
    }
  }
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Tapfolio owner"' },
  });
}

export const config = {
  matcher: ["/", "/activity/:path*", "/conversations/:path*", "/api/events", "/api/conversations/:path*"],
};
