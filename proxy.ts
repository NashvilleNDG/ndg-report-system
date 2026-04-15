import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const path = nextUrl.pathname;

  // Public paths
  if (
    path === "/login" ||
    path === "/forgot-password" ||
    path === "/reset-password" ||
    path.startsWith("/api/auth")
  ) {
    if (session && path === "/login") {
      return redirectToDashboard(session.user.role, nextUrl.origin);
    }
    return NextResponse.next();
  }

  // Unauthenticated
  if (!session) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  const role = session.user.role;

  // Role-based guards
  if (path.startsWith("/admin") && role !== "ADMIN") {
    return redirectToDashboard(role, nextUrl.origin);
  }

  if (path.startsWith("/team") && role !== "ADMIN" && role !== "TEAM") {
    return redirectToDashboard(role, nextUrl.origin);
  }

  if (path.startsWith("/client") && role !== "CLIENT") {
    return redirectToDashboard(role, nextUrl.origin);
  }

  // Root redirect
  if (path === "/") {
    return redirectToDashboard(role, nextUrl.origin);
  }

  return NextResponse.next();
});

function redirectToDashboard(role: string, origin: string) {
  const destinations: Record<string, string> = {
    ADMIN: "/admin",
    TEAM: "/team",
    CLIENT: "/client",
  };
  return NextResponse.redirect(
    new URL(destinations[role] ?? "/login", origin)
  );
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
