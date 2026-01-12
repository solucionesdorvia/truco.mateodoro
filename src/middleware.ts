import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for API routes
  if (pathname.startsWith('/api')) {
    return NextResponse.next()
  }
  
  // Get token from JWT
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  })
  
  const isLoggedIn = !!token
  
  // Public routes that don't require auth
  const publicRoutes = ['/', '/login', '/register']
  const isPublicRoute = publicRoutes.includes(pathname)
  
  // Auth routes (login, register)
  const authRoutes = ['/login', '/register']
  const isAuthRoute = authRoutes.includes(pathname)
  
  // Change password route
  const isChangePasswordRoute = pathname === '/change-password'
  
  // Admin routes
  const isAdminRoute = pathname.startsWith('/admin')
  
  // If not logged in and trying to access protected routes (except public ones)
  if (!isLoggedIn && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  // If logged in...
  if (isLoggedIn) {
    // If user needs to change password, redirect to change-password page
    if (token?.mustChangePassword && !isChangePasswordRoute && !isAuthRoute) {
      return NextResponse.redirect(new URL('/change-password', request.url))
    }
    
    // If trying to access auth routes, redirect to home
    if (isAuthRoute) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    // Admin routes require admin role
    if (isAdminRoute && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
