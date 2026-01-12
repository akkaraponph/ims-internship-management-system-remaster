import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });

  const { pathname } = request.nextUrl;
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isApiRoute = pathname.startsWith("/api");
  const isPublicAsset = 
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|webp)$/);
  const isLandingPage = pathname === "/";

  // Allow public assets, API routes, and landing page
  if (isPublicAsset || isApiRoute || isLandingPage) {
    return NextResponse.next();
  }

  // Handle auth pages
  if (isAuthPage) {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Protect all other routes
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based route protection
  const isAdminRoute = pathname.startsWith("/users") || 
                      pathname.startsWith("/settings");
  const isDirectorRoute = pathname.startsWith("/reports");
  const isSuperAdminRoute = pathname.startsWith("/universities");
  const isAnnouncementRoute = pathname.startsWith("/announcements");

  if (isSuperAdminRoute && token.role !== "super-admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isAdminRoute && token.role !== "admin" && token.role !== "super-admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isDirectorRoute && token.role !== "director" && token.role !== "admin" && token.role !== "super-admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Announcements are accessible to all authenticated users
  // But creation/editing is restricted in the API routes

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
