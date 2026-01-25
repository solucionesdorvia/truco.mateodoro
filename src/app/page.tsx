import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="landing-bg font-landing-sans">
      <header className="sticky top-0 z-50 glass-card border-b border-white/5 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl">playing_cards</span>
            <h2 className="font-landing-display text-lg font-bold tracking-tight text-white uppercase">Truco Club</h2>
          </div>
          <Link
            href="/login"
            className="bg-gold text-background-dark px-5 py-2 rounded-xl font-bold text-xs tracking-wider uppercase min-h-[44px] inline-flex items-center justify-center"
          >
            INGRESAR
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 py-10">
        <section className="text-center mb-16">
          <div className="inline-flex items-center gap-2 gold-pill px-4 py-1.5 rounded-full mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary">Liga activa · Temporada 1</span>
          </div>
          <h1 className="font-landing-display text-4xl md:text-6xl font-black text-primary leading-[1.1] mb-6 uppercase">
            EL TRUCO COMPETITIVO <br /> DE VERDAD
          </h1>
          <p className="text-white/70 text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed font-landing-sans">
            Mesas exclusivas, torneos federales y la comunidad más picante de la Argentina.
          </p>
          <div className="flex flex-col gap-4 max-w-sm mx-auto">
            <Link
              href="/jugar"
              className="bg-gold text-background-dark min-h-[56px] px-8 py-4 rounded-2xl font-black text-base hover:scale-[1.02] transition-transform gold-glow uppercase tracking-wider inline-flex items-center justify-center"
            >
              Jugar ahora
            </Link>
            <Link
              href="/rankings"
              className="glass-card min-h-[56px] px-8 py-4 rounded-2xl font-bold text-base border-gold/40 text-primary hover:bg-white/5 transition-all uppercase tracking-wider inline-flex items-center justify-center"
            >
              Ver tabla
            </Link>
          </div>
        </section>

        <section className="mb-16">
          <div className="glass-card rounded-3xl p-8 flex flex-col items-center gap-6 border-gold/20 shadow-2xl relative overflow-hidden bg-gradient-to-br from-white/[0.05] to-transparent">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="material-symbols-outlined text-8xl">account_balance_wallet</span>
            </div>
            <div className="text-center">
              <p className="text-white/50 text-[10px] font-bold uppercase tracking-[0.2em] mb-3">Saldo en cuenta</p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-6xl font-landing-display font-black text-gold">0</span>
                <span className="text-xl font-bold text-white/90">Mis Fichas</span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-4 w-full">
              <Link
                href="/fichas"
                className="bg-white/10 border border-white/20 text-white min-h-[44px] px-8 py-2 rounded-full text-sm font-bold hover:bg-white/20 transition-all w-full max-w-[240px] inline-flex items-center justify-center"
              >
                Cargar Créditos
              </Link>
              <Link
                href="/fichas"
                className="text-xs text-primary/70 font-bold uppercase tracking-widest hover:text-primary transition-colors underline decoration-primary/30"
              >
                Ver movimientos
              </Link>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="font-landing-display text-2xl font-bold mb-8 text-center uppercase tracking-widest text-white/90">Modos de Juego</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="glass-card aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 p-2 text-center border-gold/10">
              <span className="material-symbols-outlined text-gold text-3xl">person</span>
              <span className="text-xs font-black uppercase tracking-tight">1v1</span>
            </div>
            <div className="glass-card aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 p-2 text-center border-gold/10">
              <span className="material-symbols-outlined text-gold text-3xl">group</span>
              <span className="text-xs font-black uppercase tracking-tight">2v2</span>
            </div>
            <div className="glass-card aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 p-2 text-center border-gold/10">
              <span className="material-symbols-outlined text-gold text-3xl">groups_3</span>
              <span className="text-xs font-black uppercase tracking-tight">3v3</span>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-5 rounded-2xl flex items-start gap-4">
              <span className="material-symbols-outlined text-gold">schedule</span>
              <div>
                <h4 className="font-bold text-white text-xs uppercase mb-1">Mesas 24/7</h4>
                <p className="text-white/40 text-[10px] leading-tight">Siempre hay partida activa.</p>
              </div>
            </div>
            <div className="glass-card p-5 rounded-2xl flex items-start gap-4">
              <span className="material-symbols-outlined text-gold">trophy</span>
              <div>
                <h4 className="font-bold text-white text-xs uppercase mb-1">Premios reales</h4>
                <p className="text-white/40 text-[10px] leading-tight">Cobros instantáneos.</p>
              </div>
            </div>
            <div className="glass-card p-5 rounded-2xl flex items-start gap-4">
              <span className="material-symbols-outlined text-gold">payments</span>
              <div>
                <h4 className="font-bold text-white text-xs uppercase mb-1">Tus créditos</h4>
                <p className="text-white/40 text-[10px] leading-tight">Seguridad garantizada.</p>
              </div>
            </div>
            <div className="glass-card p-5 rounded-2xl flex items-start gap-4">
              <span className="material-symbols-outlined text-gold">forum</span>
              <div>
                <h4 className="font-bold text-white text-xs uppercase mb-1">Grupos activos</h4>
                <p className="text-white/40 text-[10px] leading-tight">Comunidad vibrante.</p>
              </div>
            </div>
            <div className="glass-card p-5 rounded-2xl flex items-start gap-4">
              <span className="material-symbols-outlined text-gold">partner_exchange</span>
              <div>
                <h4 className="font-bold text-white text-xs uppercase mb-1">Por equipo</h4>
                <p className="text-white/40 text-[10px] leading-tight">Pozos acumulados.</p>
              </div>
            </div>
            <div className="glass-card p-5 rounded-2xl flex items-start gap-4">
              <span className="material-symbols-outlined text-gold">verified_user</span>
              <div>
                <h4 className="font-bold text-white text-xs uppercase mb-1">Sin trampas</h4>
                <p className="text-white/40 text-[10px] leading-tight">Sistema anti-fraude.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-landing-display text-xl font-bold uppercase italic tracking-wider">Top Semanal</h2>
            <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Live Update</span>
          </div>
          <div className="flex flex-col gap-2">
            <div className="glass-card rounded-xl p-4 flex items-center justify-between border-l-4 border-l-gold">
              <div className="flex items-center gap-4">
                <span className="text-gold font-landing-display font-black text-xl w-6">1</span>
                <div>
                  <p className="font-bold text-sm">Don_Quijote88</p>
                  <p className="text-[10px] text-white/40 uppercase">Maestro</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-gold font-black text-lg">142</p>
                <p className="text-[8px] text-white/40 uppercase">Wins</p>
              </div>
            </div>
            <div className="glass-card rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-white/60 font-landing-display font-black text-xl w-6">2</span>
                <div>
                  <p className="font-bold text-sm">PampaCruel</p>
                  <p className="text-[10px] text-white/40 uppercase">Veterano</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-black text-lg">128</p>
                <p className="text-[8px] text-white/40 uppercase">Wins</p>
              </div>
            </div>
            <div className="glass-card rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-orange-400/80 font-landing-display font-black text-xl w-6">3</span>
                <div>
                  <p className="font-bold text-sm">ElGaucho_UI</p>
                  <p className="text-[10px] text-white/40 uppercase">Iniciando</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-black text-lg">115</p>
                <p className="text-[8px] text-white/40 uppercase">Wins</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16 flex flex-col gap-4">
          <a
            className="glass-card min-h-[64px] rounded-2xl px-6 flex items-center justify-between group border-green-500/20"
            href="https://wa.me/5491112345678"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-green-500">chat</span>
              </div>
              <span className="font-bold text-sm uppercase tracking-wider">Unirme a WhatsApp</span>
            </div>
            <span className="material-symbols-outlined text-white/20 group-hover:text-white transition-colors">chevron_right</span>
          </a>
          <a
            className="glass-card min-h-[64px] rounded-2xl px-6 flex items-center justify-between group border-gold/20"
            href="https://t.me/trucoargentino"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-gold">send</span>
              </div>
              <span className="font-bold text-sm uppercase tracking-wider">Canal de Telegram</span>
            </div>
            <span className="material-symbols-outlined text-white/20 group-hover:text-white transition-colors">chevron_right</span>
          </a>
        </section>

        <section className="mb-20 text-center py-16 px-6 glass-card rounded-3xl border-gold/30 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAHlumig5_6K5SyL7-WR3-nzXQb4Z1tINl_PnYialovtga-ymBRiozncr2W95WNQrnevUWhpsirvjMBr09O5i7o3EVrqwrB7svPlHFSHSe6HBepYNvfdp4QDkLwGKnEEmxPvDFRzUxgt4EXaTeN5N-Irsneqn2chdFcdGAI_96MEMYC3MkPteqZWKGSYBpYSD584JKV2bHcwDttrSCRoiuTpx68vL_04j7chbx2SKy863pRClIb996kzmyWPF3SuunbQH5mUMUPfdQ')",
              backgroundSize: 'cover',
            }}
          />
          <div className="relative z-10">
            <h2 className="font-landing-display text-3xl font-black text-white uppercase mb-8 leading-tight">CREÁ TU CUENTA Y ARRANCÁ HOY</h2>
            <Link
              href="/jugar"
              className="bg-gold text-background-dark min-h-[60px] px-12 py-5 rounded-2xl font-black text-lg hover:scale-105 transition-transform gold-glow-strong uppercase tracking-widest w-full max-w-xs inline-flex items-center justify-center"
            >
              Ir a jugar
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-12 px-8 text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-8">
          <div className="flex items-center gap-2 text-gold">
            <span className="material-symbols-outlined text-2xl">playing_cards</span>
            <span className="font-landing-display font-bold uppercase tracking-widest text-sm">Truco Club Argentino</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-gold/60">
            <Link className="hover:text-gold transition-colors" href="/soporte">Soporte</Link>
            <Link className="hover:text-gold transition-colors" href="/soporte#faq">FAQ</Link>
            <Link className="hover:text-gold transition-colors" href="/soporte">Privacidad</Link>
            <Link className="hover:text-gold transition-colors" href="/soporte">Términos</Link>
          </div>
          <div className="space-y-2">
            <p className="text-white/20 text-[10px] uppercase font-bold tracking-widest">© 2026 Todos los derechos reservados.</p>
            <p className="text-white/10 text-[9px] uppercase font-medium">Hecho por <span className="text-gold/30">Doro</span></p>
          </div>
        </div>
      </footer>
    </div>
  )
}
