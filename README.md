# 🎴 Truco Argentino Online

Plataforma completa de Truco Argentino multiplayer competitivo con sistema de rankings, comunidad, stake por equipos y panel de administración.

## 🚀 Stack Tecnológico

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **UI**: TailwindCSS + shadcn/ui
- **Backend**: Next.js Route Handlers / API Routes
- **Realtime**: Socket.IO
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: NextAuth v5 (Credentials Provider)
- **Validaciones**: Zod

## 📋 Características

### Modos de Juego
- 1 vs 1 (2 jugadores)
- 2 vs 2 (4 jugadores)
- 3 vs 3 (6 jugadores)

### Reglas del Truco Argentino
- ✅ Baraja española (40 cartas, sin 8 ni 9)
- ✅ Jerarquía completa de cartas
- ✅ Sistema de bazas (3 por ronda)
- ✅ Truco / Retruco / Vale Cuatro
- ✅ Envido / Real Envido / Falta Envido
- ✅ Flor (opcional)
- ✅ Ir al mazo

### Sistema Económico
- **Gratis**: Sin apuestas
- **Entry Fee**: Pago fijo por jugador
- **Team Pool**: Pozo colaborativo por equipo
  - Aportes editables en lobby
  - Distribución proporcional o receptor único
  - Comisión de plataforma configurable

### Nuevas Funcionalidades
- 🏆 Rankings semanal y global
- 👥 Comunidad con posts y categorías
- 🎮 Centro de juego unificado
- 💰 Wallet con historial completo
- 📞 Sistema de soporte con tickets
- 👤 Perfil con estadísticas
- 📊 Historial de partidas

## 🗺️ Rutas de la Aplicación

### Públicas
| Ruta | Descripción |
|------|-------------|
| `/` | Home / Landing page |
| `/comunidad` | Posts de la comunidad |
| `/rankings` | Rankings semanal y global |
| `/soporte` | FAQ y tickets de soporte |
| `/login` | Inicio de sesión |
| `/register` | Registro |

### Protegidas (requieren login)
| Ruta | Descripción |
|------|-------------|
| `/jugar` | Centro de juego - crear/unirse |
| `/fichas` | Wallet - saldo y transacciones |
| `/perfil` | Perfil del usuario |
| `/mis-partidas` | Historial de partidas |
| `/lobby/[roomId]` | Sala de espera |
| `/table/[roomId]` | Mesa de juego |

### Admin (requieren rol ADMIN)
| Ruta | Descripción |
|------|-------------|
| `/admin` | Panel de administración |
| `/admin/support` | Gestión de tickets |

## 🛠️ Instalación

### Prerrequisitos
- Node.js 18+
- PostgreSQL 14+
- npm o yarn

### 1. Clonar y dependencias

```bash
git clone <repo>
cd truco-argentino
npm install
```

### 2. Configurar variables de entorno

Copia `env.example` a `.env` y configura:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/truco_db?schema=public"

# NextAuth
NEXTAUTH_SECRET="tu-clave-secreta-muy-larga-y-segura"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Configurar base de datos

```bash
# Crear la base de datos y aplicar el schema
npm run db:push

# Ejecutar seed (crea admin y settings)
npm run db:seed
```

### 4. Iniciar desarrollo

```bash
npm run dev
```

La aplicación estará en `http://localhost:3000`

## 🔐 Credenciales Admin

Al ejecutar el seed se crea un usuario administrador:

- **Email**: `admin@truco.com`
- **Password**: `Admin1234!`

⚠️ El admin deberá cambiar su contraseña en el primer inicio de sesión.

## 📁 Estructura del Proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── (admin)/           # Panel admin
│   │   └── admin/
│   │       ├── page.tsx   # Dashboard
│   │       └── support/   # Tickets
│   ├── (auth)/            # Login/Register
│   ├── (game)/            # Lobby/Table
│   ├── (main)/            # Páginas principales
│   │   ├── jugar/         # Centro de juego
│   │   ├── fichas/        # Wallet
│   │   ├── rankings/      # Rankings
│   │   ├── comunidad/     # Comunidad
│   │   ├── soporte/       # Soporte
│   │   ├── perfil/        # Perfil
│   │   └── mis-partidas/  # Historial
│   └── api/               # API Routes
├── components/
│   ├── game/              # Componentes del juego
│   ├── layout/            # Navbar, BottomNav
│   ├── providers/         # Context providers
│   └── ui/                # Componentes shadcn
└── lib/
    ├── services/          # Lógica de negocio
    ├── socket/            # Socket.IO
    ├── truco/             # Motor del juego
    └── validations/       # Schemas Zod

prisma/
├── schema.prisma          # Modelos de DB
└── seed.ts                # Seed inicial
```

## 📊 Modelos de Base de Datos

### Principales
- **User** - Usuarios con balance y rol
- **GameRoom** - Salas de juego
- **GameRoomPlayer** - Jugadores en sala
- **StakeContribution** - Aportes de stake
- **CreditTransaction** - Ledger de movimientos

### Nuevos
- **PlayerStats** - Estadísticas para rankings
- **CommunityPost** - Posts de la comunidad
- **SupportTicket** - Tickets de soporte
- **SupportMessage** - Mensajes de tickets

## 🔧 API Endpoints

### Auth
- `POST /api/auth/register` - Registro
- `POST /api/auth/change-password` - Cambiar contraseña

### Rooms
- `POST /api/rooms` - Crear sala
- `POST /api/rooms/join` - Unirse
- `GET /api/rooms/[roomId]` - Estado de sala
- `POST /api/rooms/[roomId]/start` - Iniciar partida
- `POST /api/rooms/[roomId]/stake` - Actualizar aporte

### Profile
- `GET /api/profile/stats` - Estadísticas del usuario
- `GET /api/profile/games` - Historial de partidas

### Credits
- `GET /api/credits/transactions` - Historial de transacciones

### Rankings
- `GET /api/rankings` - Rankings semanal y global

### Community
- `GET /api/community/posts` - Listar posts
- `POST /api/community/posts` - Crear post
- `POST /api/community/posts/[postId]/like` - Like

### Support
- `POST /api/support/tickets` - Crear ticket
- `GET /api/support/tickets` - Mis tickets

### Admin
- `GET /api/admin/stats` - Estadísticas
- `GET /api/admin/users` - Listar usuarios
- `POST /api/admin/credits/load` - Cargar créditos
- `POST /api/admin/credits/adjust` - Ajustar créditos
- `GET/PATCH /api/admin/settings` - Configuración
- `GET /api/admin/support/tickets` - Todos los tickets
- `PATCH /api/admin/support/tickets/[ticketId]` - Actualizar ticket
- `POST /api/admin/support/tickets/[ticketId]/reply` - Responder ticket

## 🔌 Eventos Socket.IO

### Cliente → Servidor
- `room:join` - Unirse a sala
- `stake:update` - Actualizar aporte
- `game:start` - Iniciar partida
- `game:playCard` - Jugar carta
- `game:callTruco` - Cantar truco
- `game:respondTruco` - Responder truco
- `game:callEnvido` - Cantar envido
- `game:respondEnvido` - Responder envido
- `game:callFlor` - Cantar flor
- `game:fold` - Ir al mazo
- `chat:send` - Enviar mensaje

### Servidor → Cliente
- `room:state` - Estado de sala actualizado
- `game:state` - Estado del juego
- `game:started` - Partida iniciada
- `game:finished` - Partida terminada
- `chat:message` - Nuevo mensaje
- `player:joined` - Jugador se unió
- `player:disconnected` - Jugador desconectado
- `error` - Error

## 🚀 Deployment

### Build

```bash
npm run build
```

### Producción

```bash
npm start
```

### Variables de entorno requeridas
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

## 📝 Notas

- Servidor Socket.IO integrado con Next.js via servidor HTTP custom
- Estados de juego persistidos en PostgreSQL
- Validaciones server-authoritative (anti-cheat)
- Sistema de créditos con auditoría completa
- Rankings con reset semanal automático
- Navegación responsive (navbar desktop + bottomnav mobile)

---

Hecho x doro 🧉

MIT License
