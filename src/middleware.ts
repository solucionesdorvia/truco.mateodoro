import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get session token from cookies
  const sessionToken = request.cookies.get('authjs.session-token')?.value 
    || request.cookies.get('__Secure-authjs.session-token')?.value
  
  const { pathname } = request.nextUrl
  
  const isLoggedIn = !!sessionToken
  
  // Public routes
  const publicRoutes = ['/', '/login', '/register']
  const isPublicRoute = publicRoutes.includes(pathname)
  
  // Auth routes
  const authRoutes = ['/login', '/register']
  const isAuthRoute = authRoutes.includes(pathname)
  
  // If not logged in and trying to access protected routes
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // If logged in and trying to access auth routes
  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
