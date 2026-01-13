import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get session token from cookies
  const sessionToken = request.cookies.get('authjs.session-token')?.value 
    || request.cookies.get('__Secure-authjs.session-token')?.value
  
  const { pathname } = request.nextUrl
  
  const isLoggedIn = !!sessionToken
  
  // Public routes (accessible without login)
  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/comunidad',
    '/rankings',
    '/soporte',
  ]
  
  // Check if current path matches a public route
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )
  
  // Auth routes (only for non-logged users)
  const authRoutes = ['/login', '/register']
  const isAuthRoute = authRoutes.includes(pathname)
  
  // Protected routes (require login)
  const protectedRoutes = [
    '/jugar',
    '/fichas',
    '/perfil',
    '/mis-partidas',
    '/admin',
    '/lobby',
    '/table',
    '/create',
    '/join',
  ]
  
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  )
  
  // If not logged in and trying to access protected routes
  if (!isLoggedIn && isProtectedRoute) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
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
