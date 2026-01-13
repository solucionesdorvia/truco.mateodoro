'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { 
  Users, 
  Swords, 
  Coins, 
  LifeBuoy, 
  Trophy,
  LogOut,
  User,
  History,
  Shield,
  Menu,
  Sparkles
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
  { href: '/jugar', label: 'Jugar', icon: Swords },
  { href: '/fichas', label: 'Fichas', icon: Coins },
  { href: '/soporte', label: 'Soporte', icon: LifeBuoy },
  { href: '/rankings', label: 'Rankings', icon: Trophy },
]

// Logo SVG - Palo de espadas estilizado
function TrucoLogo({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 32 32" 
      className={className}
      fill="currentColor"
    >
      <path d="M16 2C16 2 12 8 12 12C12 14.5 13.5 16.5 16 17C18.5 16.5 20 14.5 20 12C20 8 16 2 16 2Z" />
      <path d="M16 17V28" strokeWidth="2.5" stroke="currentColor" fill="none" strokeLinecap="round"/>
      <path d="M12 24H20" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round"/>
      <circle cx="16" cy="14" r="2" fill="currentColor" opacity="0.3"/>
    </svg>
  )
}

export function Navbar() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const isLoading = status === 'loading'

  return (
    <header className="sticky top-0 z-50 w-full border-b border-paño/20 bg-noche/90 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative">
            <div className="w-10 h-10 rounded-club bg-gradient-to-br from-paño to-paño-600 flex items-center justify-center shadow-lg shadow-paño/30 group-hover:shadow-paño/50 transition-all duration-300">
              <TrucoLogo className="w-6 h-6 text-naipe" />
            </div>
          </div>
          <div className="hidden sm:flex flex-col -space-y-1">
            <span className="font-bold text-lg tracking-tight text-naipe">
              TRUCO
            </span>
            <span className="text-[10px] tracking-[0.2em] text-oro uppercase font-semibold">
              Argentino
            </span>
          </div>
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
                  'flex items-center gap-2 px-4 py-2.5 rounded-club text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-paño/30 text-naipe border border-paño/40'
                    : 'text-naipe-600 hover:text-naipe hover:bg-noche-100/50'
                )}
              >
                <Icon className={cn("w-4 h-4", isActive && "text-oro")} />
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
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full bg-noche-100 border border-oro/30 hover:border-oro/60 hover:shadow-glow-oro transition-all duration-200"
            >
              <Coins className="w-4 h-4 text-oro" />
              <span className="text-sm font-bold text-oro tabular-nums">
                {session.user.creditsBalance ?? 0}
              </span>
            </Link>
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="text-naipe-600 hover:text-naipe hover:bg-noche-100">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-noche-100 border-paño/20">
              <SheetHeader>
                <SheetTitle className="text-naipe flex items-center gap-2">
                  <TrucoLogo className="w-5 h-5 text-paño" />
                  Menú
                </SheetTitle>
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
                        'flex items-center gap-3 px-4 py-3.5 rounded-club text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'bg-paño/30 text-naipe border border-paño/40'
                          : 'text-naipe-600 hover:text-naipe hover:bg-noche-200'
                      )}
                    >
                      <Icon className={cn("w-5 h-5", isActive && "text-oro")} />
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
            </SheetContent>
          </Sheet>

          {/* User Menu / Auth Buttons */}
          {isLoading ? (
            <div className="w-10 h-10 rounded-full bg-noche-100 animate-pulse" />
          ) : session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="relative h-10 w-10 rounded-full p-0 hover:ring-2 hover:ring-paño/50 transition-all duration-200"
                >
                  <Avatar className="h-10 w-10 border-2 border-paño/30">
                    <AvatarFallback className="bg-gradient-to-br from-paño to-paño-600 text-naipe font-bold text-sm">
                      {session.user.username?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-56 bg-noche-100 border-paño/20" 
                align="end"
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold text-naipe">{session.user.username}</p>
                    <p className="text-xs text-naipe-700">{session.user.email}</p>
                    <div className="flex items-center gap-1 pt-1">
                      <Coins className="w-3 h-3 text-oro" />
                      <p className="text-xs text-oro font-bold">
                        {session.user.creditsBalance ?? 0} fichas
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-paño/20" />
                <DropdownMenuItem asChild className="cursor-pointer hover:bg-noche-200 focus:bg-noche-200">
                  <Link href="/perfil" className="flex items-center text-naipe-400">
                    <User className="mr-2 h-4 w-4" />
                    Mi Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer hover:bg-noche-200 focus:bg-noche-200">
                  <Link href="/mis-partidas" className="flex items-center text-naipe-400">
                    <History className="mr-2 h-4 w-4" />
                    Mis Partidas
                  </Link>
                </DropdownMenuItem>
                {session.user.role === 'ADMIN' && (
                  <DropdownMenuItem asChild className="cursor-pointer hover:bg-noche-200 focus:bg-noche-200">
                    <Link href="/admin" className="flex items-center text-celeste">
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-paño/20" />
                <DropdownMenuItem 
                  className="cursor-pointer hover:bg-destructive/20 focus:bg-destructive/20 text-destructive"
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
                <Button variant="ghost" className="text-naipe-400 hover:text-naipe hover:bg-noche-100">
                  Entrar
                </Button>
              </Link>
              <Link href="/register" className="hidden sm:block">
                <Button className="btn-pano flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
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
