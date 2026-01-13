'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Users, 
  Gamepad2, 
  Coins, 
  HelpCircle, 
  Trophy 
} from 'lucide-react'

import { cn } from '@/lib/utils'

const navItems = [
  { href: '/comunidad', label: 'Comunidad', icon: Users },
  { href: '/jugar', label: 'Jugar', icon: Gamepad2, primary: true },
  { href: '/fichas', label: 'Fichas', icon: Coins },
  { href: '/rankings', label: 'Rankings', icon: Trophy },
  { href: '/soporte', label: 'Soporte', icon: HelpCircle },
]

export function BottomNav() {
  const pathname = usePathname()

  // Don't show on lobby/table pages
  if (pathname.startsWith('/lobby/') || pathname.startsWith('/table/')) {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div className="bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/50">
        <div className="flex items-center justify-around px-2 py-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            
            if (item.primary) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative -mt-6"
                >
                  <div className={cn(
                    'flex flex-col items-center justify-center w-16 h-16 rounded-2xl shadow-lg transition-all',
                    isActive 
                      ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/40' 
                      : 'bg-gradient-to-br from-amber-500/80 to-orange-600/80 shadow-amber-500/20 hover:from-amber-500 hover:to-orange-600'
                  )}>
                    <Icon className="w-6 h-6 text-white" />
                    <span className="text-[10px] font-semibold text-white mt-0.5">{item.label}</span>
                  </div>
                </Link>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center w-16 py-2 transition-colors',
                  isActive ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'
                )}
              >
                <Icon className={cn('w-5 h-5', isActive && 'drop-shadow-glow')} />
                <span className="text-[10px] font-medium mt-1">{item.label}</span>
              </Link>
            )
          })}
        </div>
        {/* Safe area for iOS */}
        <div className="h-safe-area-inset-bottom bg-slate-950" />
      </div>
    </nav>
  )
}

