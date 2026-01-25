'use client'

export default function JoinPrivateGamePage() {
  return (
    <div className="w-full h-[100svh] bg-black">
      <iframe
        title="Unirse a mesa privada"
        src="/designs/stitch_truco_lobby_mesas_activas/unirse_con_código_privado/code.html"
        className="w-full h-full border-0"
      />
    </div>
  )
}
