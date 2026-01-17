'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

type CardSuit = 'espada' | 'basto' | 'oro' | 'copa'
type CardSize = 'sm' | 'md' | 'lg'

interface TrucoCardImageProps {
  suit: CardSuit
  rank: number
  size?: CardSize
  selected?: boolean
  disabled?: boolean
  faceDown?: boolean
  backSrc?: string
  className?: string
  onClick?: () => void
  onPointerDown?: () => void
}

const sizeClasses: Record<CardSize, string> = {
  sm: 'w-12 h-[4.5rem]',
  md: 'w-20 h-28',
  lg: 'w-28 h-40',
}

export function TrucoCardImage({
  suit,
  rank,
  size = 'md',
  selected = false,
  disabled = false,
  faceDown = false,
  backSrc = '/cards/back.png',
  className,
  onClick,
  onPointerDown,
}: TrucoCardImageProps) {
  const [ext, setExt] = useState<'png' | 'webp' | 'placeholder'>('png')
  const [backError, setBackError] = useState(false)

  useEffect(() => {
    setExt('png')
  }, [suit, rank, faceDown])

  useEffect(() => {
    setBackError(false)
  }, [backSrc, faceDown])

  const src = faceDown ? backSrc : `/cards/${suit}/${rank}.${ext === 'webp' ? 'webp' : 'png'}`
  const showPlaceholder = ext === 'placeholder' || backError

  const handleError = () => {
    if (faceDown) {
      console.warn(`[TrucoCardImage] Back image failed: ${backSrc}`)
      setBackError(true)
      return
    }

    console.warn(`[TrucoCardImage] Failed to load ${suit}/${rank} from ${src}`)
    if (ext === 'png') {
      setExt('webp')
      return
    }
    if (ext === 'webp') {
      setExt('placeholder')
    }
  }

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      onPointerDown={disabled ? undefined : onPointerDown}
      className={cn(
        'relative rounded-xl transition-transform duration-150 focus:outline-none',
        sizeClasses[size],
        selected && 'ring-4 ring-amber-400 -translate-y-3',
        disabled && 'opacity-70 cursor-not-allowed',
        !disabled && 'hover:-translate-y-1',
        className
      )}
    >
      {showPlaceholder ? (
        <div className="h-full w-full rounded-xl bg-noche-100 border border-paño/40 flex items-center justify-center text-naipe-500 text-xs">
          Carta
        </div>
      ) : (
        <img
          src={src}
          alt={faceDown ? 'Carta boca abajo' : `${rank} de ${suit}`}
          className="h-full w-full rounded-xl object-cover"
          draggable={false}
          onError={handleError}
        />
      )}
    </button>
  )
}
