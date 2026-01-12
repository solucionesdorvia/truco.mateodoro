# 🎴 Truco Argentino Online

Aplicación web completa de Truco Argentino multiplayer en tiempo real, con sistema de usuarios, créditos, partidas pagas y sistema avanzado de pozo por equipo.

## 🚀 Stack Tecnológico

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **UI**: TailwindCSS + shadcn/ui
- **Backend**: Next.js Route Handlers / API Routes
- **Realtime**: Socket.IO
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: NextAuth v5 (Credentials Provider)
- **Validaciones**: Zod
- **Passwords**: bcrypt

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
- **Team Pool**: Pozo colaborativo por equipo (feature principal)
  - Aportes editables en lobby
  - Distribución proporcional o receptor único
  - Comisión de plataforma configurable

### Funcionalidades
- Autenticación (registro/login)
- Reconexión automática
- Chat en tiempo real
- Timer por turno (opcional)
- Panel de administración completo

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
│   ├── (admin)/           # Rutas admin
│   ├── (auth)/            # Login/Register
│   ├── (game)/            # Create/Join/Lobby/Table
│   └── api/               # API Routes
├── components/
│   ├── game/              # Componentes del juego
│   ├── providers/         # Context providers
│   └── ui/                # Componentes shadcn
└── lib/
    ├── services/          # Lógica de negocio
    ├── socket/            # Cliente y servidor Socket.IO
    ├── truco/             # Motor del juego
    └── validations/       # Schemas Zod

prisma/
├── schema.prisma          # Modelos de DB
└── seed.ts                # Seed inicial
```

## 🎮 Cómo Funciona

### Crear Partida
1. Usuario crea partida configurando modo, puntos objetivo, flor, timer y economía
2. Se generan 2 códigos únicos (uno por equipo)
3. El creador entra automáticamente al Equipo A

### Unirse a Partida
1. Usuario ingresa código de equipo
2. Se asigna automáticamente al equipo correspondiente
3. En lobby puede ver otros jugadores y configurar su aporte (si es TEAM_POOL)

### Sistema de Pozo (TEAM_POOL)
1. Cada equipo debe reunir el monto total configurado
2. Jugadores aportan de su saldo (editable en lobby)
3. Al iniciar, los aportes se bloquean y descuentan del saldo
4. El equipo ganador recibe el premio según modo de pago:
   - **Proporcional**: Según % aportado
   - **Receptor único**: Todo a un jugador designado

### Durante el Juego
- El motor valida todas las jugadas server-side
- Socket.IO sincroniza estado en tiempo real
- Reconexión automática (90s ventana)

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

### Admin
- `GET /api/admin/stats` - Estadísticas
- `GET /api/admin/users` - Listar usuarios
- `POST /api/admin/credits/load` - Cargar créditos
- `POST /api/admin/credits/adjust` - Ajustar créditos
- `GET/PATCH /api/admin/settings` - Configuración

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
- `game:state` - Estado del juego (vista del jugador)
- `game:started` - Partida iniciada
- `game:finished` - Partida terminada
- `chat:message` - Nuevo mensaje
- `player:joined` - Jugador se unió
- `player:disconnected` - Jugador desconectado
- `error` - Error

## 📊 Modelos de Base de Datos

### User
- Autenticación y perfil
- Balance de créditos
- Rol (USER/ADMIN)

### GameRoom
- Configuración de partida
- Códigos de equipo
- Estado del juego (JSON)
- Configuración de apuesta

### CreditTransaction
- Ledger completo de movimientos
- Tipos: ADMIN_LOAD, ADMIN_ADJUST, STAKE_LOCK, STAKE_REFUND, STAKE_PAYOUT

### StakeContribution
- Aportes por jugador/equipo
- Bloqueo al iniciar partida

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

- El servidor usa Socket.IO integrado con Next.js a través de un servidor HTTP custom
- Los estados de juego se persisten en PostgreSQL para recuperación ante caídas
- Las validaciones son server-authoritative (anti-cheat)
- El sistema de créditos mantiene auditoría completa vía ledger

## 🧉 Hecho con amor en Argentina

---

MIT License
