import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the path starts with /admin
  if (pathname.startsWith("/admin")) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    // If no token or not an admin, redirect to login
    if (!token || token.role !== "admin") {
      const url = new URL("/auth/login", request.url)
      url.searchParams.set("callbackUrl", encodeURI(pathname))
      return NextResponse.redirect(url)
    }
  }

  // Don't auto-redirect for API routes, auth pages, or static assets
  if (pathname.startsWith("/api") || pathname.startsWith("/auth") || pathname.includes(".") || pathname === "/") {
    return NextResponse.next()
  }

  // For other protected routes, check if user is authenticated
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // If no token, redirect to login
  if (!token) {
    const url = new URL("/auth/login", request.url)
    url.searchParams.set("callbackUrl", encodeURI(pathname))
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/orders/:path*",
    "/checkout",
    "/cart",
    "/profile/:path*",
    "/((?!api|auth|_next/static|_next/image|favicon.ico).*)",
  ],
}
