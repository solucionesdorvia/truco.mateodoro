import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const user = req.auth?.user
  
  // Public routes that don't require auth
  const publicRoutes = ['/', '/login', '/register']
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname)
  
  // Auth routes (login, register)
  const authRoutes = ['/login', '/register']
  const isAuthRoute = authRoutes.includes(nextUrl.pathname)
  
  // Change password route
  const isChangePasswordRoute = nextUrl.pathname === '/change-password'
  
  // If user needs to change password, redirect to change-password page
  if (isLoggedIn && user?.mustChangePassword && !isChangePasswordRoute && !isAuthRoute) {
    return NextResponse.redirect(new URL('/change-password', nextUrl))
  }
  
  // If logged in and trying to access auth routes, redirect to home
  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL('/', nextUrl))
  }
  
  // If not logged in and trying to access protected routes
  if (!isLoggedIn && !isPublicRoute && !isAuthRoute) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }
  
  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}

