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
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main className="pb-20 lg:pb-0">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}

