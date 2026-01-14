import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Helper function to check for demo mode session
function getDemoSession(request: NextRequest): any | null {
  const demoSessionCookie = request.cookies.get("demo_session");
  if (!demoSessionCookie) return null;
  
  try {
    const sessionData = JSON.parse(decodeURIComponent(demoSessionCookie.value));
    // Validate session has required fields
    if (sessionData && sessionData.id && sessionData.role) {
      return sessionData;
    }
  } catch {
    // Invalid cookie format
    return null;
  }
  
  return null;
}

// Helper function to check if demo mode is active
function isDemoModeActive(request: NextRequest): boolean {
  const demoModeCookie = request.cookies.get("demo_mode");
  const demoParam = request.nextUrl.searchParams.get("demo");
  return demoModeCookie?.value === "true" || demoParam === "true";
}

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });

  // Check for demo mode session
  const demoSession = getDemoSession(request);
  const isDemoActive = isDemoModeActive(request);
  const hasValidSession = token || (isDemoActive && demoSession);

  const { pathname } = request.nextUrl;
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isApiRoute = pathname.startsWith("/api");
  const isPublicAsset = 
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|webp)$/);
  const isLandingPage = pathname === "/";
  const isPublicProfile = pathname.startsWith("/profile/public/");
  
  // Public routes that don't require authentication
  const isPublicRoute = 
    pathname === "/jobs" ||
    pathname.startsWith("/jobs/") ||
    pathname.startsWith("/companies/public") ||
    pathname === "/statistics" ||
    pathname.startsWith("/announcements/public");

  // Allow public assets, API routes, landing page, public profile pages, and public routes
  if (isPublicAsset || isApiRoute || isLandingPage || isPublicProfile || isPublicRoute) {
    return NextResponse.next();
  }

  // Handle auth pages
  if (isAuthPage) {
    if (hasValidSession) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Protect all other routes
  if (!hasValidSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    if (isDemoActive) {
      loginUrl.searchParams.set("demo", "true");
    }
    return NextResponse.redirect(loginUrl);
  }

  // Role-based route protection
  // Use demo session role if in demo mode, otherwise use token role
  const userRole = isDemoActive && demoSession ? demoSession.role : token?.role;
  
  const isAdminRoute = pathname.startsWith("/users") || 
                      pathname.startsWith("/settings");
  const isDirectorRoute = pathname.startsWith("/reports");
  const isSuperAdminRoute = pathname.startsWith("/universities");
  const isCompanyRoute = pathname.startsWith("/company");
  const isAnnouncementRoute = pathname.startsWith("/announcements");

  if (isSuperAdminRoute && userRole !== "super-admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isAdminRoute && userRole !== "admin" && userRole !== "super-admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isDirectorRoute && userRole !== "director" && userRole !== "admin" && userRole !== "super-admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isCompanyRoute && userRole !== "company") {
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
