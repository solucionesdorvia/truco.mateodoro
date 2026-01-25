'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from './Navbar'
import { BottomNav } from './BottomNav'

interface MainLayoutProps {
  children: React.ReactNode
}

// Pages where we don't want the standard layout
const excludedPaths = [
  '/login',
  '/register',
  '/change-password',
  '/jugar',
  '/soporte',
  '/game/join',
  '/game/create',
  '/game/join-private',
  '/lobby/',
  '/table/',
]

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname()
  
  // Check if we should exclude the layout
  const shouldExclude = excludedPaths.some(path => 
    pathname === path || pathname.startsWith(path)
  )

  if (shouldExclude) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-noche relative">
      {/* Subtle background texture */}
      <div className="fixed inset-0 opacity-[0.015] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CiAgPHBhdHRlcm4gaWQ9InBhdHRlcm4iIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CiAgICA8Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxIiBmaWxsPSIjZmZmIi8+CiAgPC9wYXR0ZXJuPgogIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjcGF0dGVybikiLz4KPC9zdmc+')] bg-repeat" />
      
      {/* Ambient gradient */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-paño/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative">
        <Navbar />
        <main className="pb-24 lg:pb-8">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  )
}
