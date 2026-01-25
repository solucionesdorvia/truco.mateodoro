import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="landing-bg font-landing-sans">
      <main className="max-w-5xl mx-auto px-5 py-10 pt-8">
        <section className="mb-16">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
            <div>
              <div className="inline-flex items-center gap-2 gold-pill px-4 py-1.5 rounded-full mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary">Liga activa · Temporada 1</span>
        </div>
              <h1 className="font-landing-display text-4xl md:text-6xl font-black text-primary leading-[1.1] mb-6 uppercase">
                EL TRUCO COMPETITIVO <br /> DE VERDAD
            </h1>
              <p className="text-white/70 text-base md:text-lg max-w-xl mb-8 leading-relaxed font-landing-sans">
                Mesas exclusivas, torneos federales y la comunidad más picante de la Argentina.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md">
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
              <div className="mt-8 grid grid-cols-2 gap-3 text-xs text-white/60">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-gold text-base">bolt</span>
                  Arrancá en menos de 10s
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-gold text-base">verified</span>
                  Fair play garantizado
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-gold text-base">groups</span>
                  Equipos y duplas
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-gold text-base">military_tech</span>
                  Ranking semanal
            </div>
          </div>
        </div>
        
            <div className="relative">
              <div className="glass-card rounded-3xl p-6 border-gold/20 shadow-2xl bg-gradient-to-br from-white/[0.06] to-transparent">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-white/50 font-bold">Mesa en vivo</span>
                  <span className="text-[10px] uppercase tracking-[0.25em] text-primary font-bold">LIVE</span>
                </div>
                <div className="rounded-2xl border border-white/10 p-4 bg-white/[0.02]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-white/50 uppercase tracking-[0.2em] mb-1">Modo</p>
                      <p className="text-lg font-black text-white">2v2 · 30 pts</p>
                    </div>
                    <span className="material-symbols-outlined text-gold text-3xl">sports_esports</span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-white/60">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-gold text-sm">payments</span>
                      Entrada fija
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-gold text-sm">schedule</span>
                      Activa ahora
                    </div>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-2">
                  {['Equipo A', 'Equipo B', 'Pozo'].map((label) => (
                    <div key={label} className="rounded-xl border border-white/10 p-3 text-center bg-white/[0.02]">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">{label}</p>
                      <p className="text-sm font-bold text-white mt-1">2/2</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5">
                  <Link
                    href="/jugar"
                    className="w-full bg-gold text-background-dark min-h-[44px] px-6 py-2 rounded-xl font-bold text-xs tracking-wider uppercase inline-flex items-center justify-center"
                  >
                    Entrar a mesas
                  </Link>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gold/20 blur-2xl rounded-full" />
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Mesas activas', value: '128', icon: 'table_bar' },
              { label: 'Jugadores online', value: '2.4k', icon: 'sports_kabaddi' },
              { label: 'Premios semanales', value: '$1.6M', icon: 'emoji_events' },
            ].map((stat) => (
              <div key={stat.label} className="glass-card rounded-2xl p-4 border-gold/10 text-center">
                <span className="material-symbols-outlined text-gold text-2xl">{stat.icon}</span>
                <p className="text-lg font-black text-white mt-2">{stat.value}</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">{stat.label}</p>
              </div>
            ))}
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
              <p className="text-[11px] text-white/40 mt-3">1 ficha = 1 crédito · Usalas en mesas con pozo.</p>
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
          <div className="text-center mb-8">
            <h2 className="font-landing-display text-2xl font-bold uppercase tracking-widest text-white/90">Cómo se juega</h2>
            <p className="text-white/50 text-sm mt-2">Entrás, elegís y en menos de 10 segundos estás jugando.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { step: '01', title: 'Elegí mesa', desc: 'Pública o privada, gratis o con pozo.', icon: 'table_restaurant' },
              { step: '02', title: 'Armá equipo', desc: '1v1, 2v2 o 3v3 con tus amigos.', icon: 'groups' },
              { step: '03', title: 'Ganás fichas', desc: 'Subís en el ranking y cobrás premios.', icon: 'emoji_events' },
            ].map((item) => (
              <div key={item.step} className="glass-card rounded-2xl p-5 border-gold/10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold tracking-[0.3em] text-white/40">{item.step}</span>
                  <span className="material-symbols-outlined text-gold">{item.icon}</span>
                </div>
                <h3 className="font-bold text-white mb-2 uppercase text-sm">{item.title}</h3>
                <p className="text-white/50 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-landing-display text-xl font-bold uppercase tracking-widest text-white/90">Por qué Truco Club</h2>
            <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Premium</span>
          </div>
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
          <div className="mt-4">
            <Link
              href="/rankings"
              className="glass-card min-h-[44px] px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-primary hover:bg-white/5 transition-all inline-flex items-center justify-center w-full"
            >
              Ver ranking completo
            </Link>
          </div>
        </section>

        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-landing-display text-xl font-bold uppercase tracking-widest text-white/90">Comunidad</h2>
            <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">On fire</span>
          </div>
          <div className="flex flex-col gap-4">
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
          </div>
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
