'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Users, 
  Swords, 
  Coins, 
  LifeBuoy, 
  Trophy 
} from 'lucide-react'

import { cn } from '@/lib/utils'

const navItems = [
  { href: '/comunidad', label: 'Comunidad', icon: Users },
  { href: '/fichas', label: 'Fichas', icon: Coins },
  { href: '/jugar', label: 'Jugar', icon: Swords, primary: true },
  { href: '/rankings', label: 'Rankings', icon: Trophy },
  { href: '/soporte', label: 'Soporte', icon: LifeBuoy },
]

export function BottomNav() {
  const pathname = usePathname()

  // Don't show on lobby/table pages
  if (pathname.startsWith('/lobby/') || pathname.startsWith('/table/')) {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div className="bg-noche/95 backdrop-blur-xl border-t border-paño/20">
        <div className="flex items-center justify-around px-1 py-1.5">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            
            if (item.primary) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative -mt-7"
                >
                  <div className={cn(
                    'flex flex-col items-center justify-center w-16 h-16 rounded-2xl shadow-lg transition-all duration-300',
                    isActive 
                      ? 'bg-gradient-to-br from-paño to-paño-600 shadow-paño/50 scale-105' 
                      : 'bg-gradient-to-br from-paño/80 to-paño-600/80 shadow-paño/30 hover:scale-105'
                  )}>
                    <Icon className="w-6 h-6 text-naipe" />
                    <span className="text-[9px] font-bold text-naipe mt-0.5 uppercase tracking-wide">
                      {item.label}
                    </span>
                  </div>
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-oro shadow-glow-oro" />
                  )}
                </Link>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center w-14 py-2 transition-all duration-200',
                  isActive ? 'text-naipe' : 'text-naipe-700 active:text-naipe'
                )}
              >
                <div className="relative">
                  <Icon className={cn(
                    'w-5 h-5 transition-colors duration-200',
                    isActive && 'text-oro'
                  )} />
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-oro" />
                  )}
                </div>
                <span className={cn(
                  'text-[10px] font-medium mt-1.5 transition-colors duration-200',
                  isActive && 'text-naipe font-semibold'
                )}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
        {/* Safe area for iOS */}
        <div className="pb-safe bg-noche" />
      </div>
    </nav>
  )
}
