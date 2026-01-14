'use client'

interface TableBackgroundProps {
  children: React.ReactNode
}

export function TableBackground({ children }: TableBackgroundProps) {
  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Capa base - madera oscura */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(180deg, 
              #1a0f0a 0%, 
              #2d1810 20%, 
              #3d2114 50%,
              #2d1810 80%,
              #1a0f0a 100%
            )
          `,
        }}
      />
      
      {/* Textura de madera */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              90deg,
              transparent 0px,
              rgba(0,0,0,0.03) 1px,
              transparent 2px,
              transparent 20px
            ),
            repeating-linear-gradient(
              0deg,
              transparent 0px,
              rgba(139,90,43,0.08) 100px,
              transparent 200px
            )
          `,
        }}
      />
      
      {/* Vetas de madera */}
      <div 
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              87deg,
              transparent 0px,
              rgba(89,50,23,0.3) 2px,
              transparent 4px,
              transparent 80px
            )
          `,
        }}
      />
      
      {/* Área central de paño verde */}
      <div className="absolute inset-8 sm:inset-12 lg:inset-16 rounded-[60px] overflow-hidden">
        {/* Borde de madera interior */}
        <div 
          className="absolute inset-0 rounded-[60px]"
          style={{
            background: 'linear-gradient(135deg, #4a2c17 0%, #2d1810 50%, #1a0f0a 100%)',
            padding: '8px',
          }}
        >
          {/* Paño verde */}
          <div 
            className="w-full h-full rounded-[52px] relative overflow-hidden"
            style={{
              background: `
                radial-gradient(ellipse 120% 100% at 50% 0%, 
                  #1d5a32 0%, 
                  #145a2a 30%,
                  #0f4a22 60%,
                  #0a3a1a 100%
                )
              `,
            }}
          >
            {/* Textura de fieltro */}
            <div 
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              }}
            />
            
            {/* Gradiente de iluminación central */}
            <div 
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(34,139,34,0.15) 0%, transparent 70%)',
              }}
            />
            
            {/* Watermark logo central - muy sutil */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-32 h-32 sm:w-48 sm:h-48 opacity-[0.04]">
                <svg viewBox="0 0 100 100" className="w-full h-full text-white">
                  {/* Espada estilizada */}
                  <path 
                    d="M50 10 L55 30 L52 30 L52 70 L58 75 L58 80 L50 85 L42 80 L42 75 L48 70 L48 30 L45 30 Z" 
                    fill="currentColor"
                  />
                  <circle cx="50" cy="22" r="3" fill="currentColor" opacity="0.5" />
                </svg>
              </div>
            </div>
            
            {/* Sombra interior suave */}
            <div 
              className="absolute inset-0 rounded-[52px]"
              style={{
                boxShadow: 'inset 0 0 100px rgba(0,0,0,0.4), inset 0 0 40px rgba(0,0,0,0.2)',
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Luz ambiental superior */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[300px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(255,200,100,0.08) 0%, transparent 70%)',
        }}
      />
      
      {/* Contenido */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  )
}

