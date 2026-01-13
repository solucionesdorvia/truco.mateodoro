'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { 
  Users, 
  Gamepad2, 
  Coins, 
  HelpCircle, 
  Trophy,
  LogOut,
  User,
  History,
  Shield,
  Menu
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

const navItems = [
  { href: '/comunidad', label: 'Comunidad', icon: Users },
  { href: '/jugar', label: 'Jugar', icon: Gamepad2 },
  { href: '/fichas', label: 'Fichas', icon: Coins },
  { href: '/soporte', label: 'Soporte', icon: HelpCircle },
  { href: '/rankings', label: 'Rankings', icon: Trophy },
]

export function Navbar() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const isLoading = status === 'loading'

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-all">
              <span className="text-xl font-bold text-white">T</span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-slate-950" />
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent hidden sm:block">
            Truco
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  isActive
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Credits Badge (logged in) */}
          {session?.user && (
            <Link 
              href="/fichas"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50 hover:border-amber-500/50 transition-colors"
            >
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-amber-400">
                {session.user.creditsBalance ?? 0}
              </span>
            </Link>
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-slate-900 border-slate-800">
              <SheetHeader>
                <SheetTitle className="text-white">Menú</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-2 mt-6">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all',
                        isActive
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
            </SheetContent>
          </Sheet>

          {/* User Menu / Auth Buttons */}
          {isLoading ? (
            <div className="w-10 h-10 rounded-full bg-slate-800 animate-pulse" />
          ) : session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="relative h-10 w-10 rounded-full p-0 hover:ring-2 hover:ring-amber-500/50"
                >
                  <Avatar className="h-10 w-10 border-2 border-slate-700">
                    <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white font-bold">
                      {session.user.username?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-56 bg-slate-900 border-slate-800" 
                align="end"
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-white">{session.user.username}</p>
                    <p className="text-xs text-slate-400">{session.user.email}</p>
                    <p className="text-xs text-amber-400 font-semibold">
                      {session.user.creditsBalance ?? 0} fichas
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-800" />
                <DropdownMenuItem asChild className="cursor-pointer hover:bg-slate-800 focus:bg-slate-800">
                  <Link href="/perfil" className="flex items-center text-slate-300">
                    <User className="mr-2 h-4 w-4" />
                    Mi Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer hover:bg-slate-800 focus:bg-slate-800">
                  <Link href="/mis-partidas" className="flex items-center text-slate-300">
                    <History className="mr-2 h-4 w-4" />
                    Mis Partidas
                  </Link>
                </DropdownMenuItem>
                {session.user.role === 'ADMIN' && (
                  <DropdownMenuItem asChild className="cursor-pointer hover:bg-slate-800 focus:bg-slate-800">
                    <Link href="/admin" className="flex items-center text-purple-400">
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-slate-800" />
                <DropdownMenuItem 
                  className="cursor-pointer hover:bg-red-900/30 focus:bg-red-900/30 text-red-400"
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/register" className="hidden sm:block">
                <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/20">
                  Registrarse
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

