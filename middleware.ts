import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/dashboard", "/boards"];

export function middleware(request: NextRequest) {
  const isProtected = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );
  const hasSession = Boolean(request.cookies.get("mini_trello_session")?.value);

  if (isProtected && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (
    hasSession &&
    (request.nextUrl.pathname === "/login" ||
      request.nextUrl.pathname === "/register")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/boards/:path*", "/login", "/register"]
};
