'use client'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

interface HistoryEvent {
  id: string
  type: string
  playerId: string
  data: Record<string, unknown>
  timestamp: number
}

interface PlayerInfo {
  playerId: string
  name: string
}

interface HistoryDrawerProps {
  log: HistoryEvent[]
  players: PlayerInfo[]
  formatEntry: (event: HistoryEvent) => string
}

export function HistoryDrawer({ log, players, formatEntry }: HistoryDrawerProps) {
  const ordered = [...log].reverse()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-naipe-400 hover:text-naipe hover:bg-noche/40 rounded-club"
        >
          Historial
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="bg-noche-100 border-paño/30 max-h-[60vh]">
        <SheetHeader>
          <SheetTitle className="text-naipe">Historial de la mano</SheetTitle>
        </SheetHeader>
        <ScrollArea className="mt-4 h-[40vh] pr-2">
          <div className="space-y-2">
            {ordered.length === 0 && (
              <p className="text-sm text-naipe-500">Sin eventos todavía.</p>
            )}
            {ordered.map(entry => (
              <div key={entry.id} className="text-sm text-naipe-300">
                {formatEntry(entry)}
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
