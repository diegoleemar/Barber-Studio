# Barber Studio

Sistema de reservas moderno, elegante y 100% gratuito para barberos y barberías en Venezuela.

- Stack: **Next.js 14** (App Router) + **Supabase** (Auth, DB, Storage, Realtime) + **Tailwind CSS**
- Diseño: **estilo iOS / Apple** (pill buttons, bottom sheets, blur translúcido, paleta negro + dorado #C9A84C)
- Autenticación: **solo Google OAuth** (sin email/contraseña)
- Pagos: **sin pasarela** — Pago Móvil, transferencia y efectivo en divisas (Venezuela)
- Costo de operación: **$0** (Vercel Hobby + Supabase Free)

---

## 1. Requisitos previos

- Node.js 18.17+
- Cuenta en [Supabase](https://supabase.com) (free)
- Cuenta en [Google Cloud Console](https://console.cloud.google.com) (gratuita)
- Cuenta en [Vercel](https://vercel.com) (free, opcional para deploy)

---

## 2. Configurar Supabase

### 2.1. Crear proyecto
1. Entra a https://supabase.com → **New project**.
2. Anota el `Project URL` y la `anon public key` (Settings → API).

### 2.2. Crear las tablas y políticas RLS
1. Abre **SQL Editor** en tu proyecto Supabase.
2. Copia y ejecuta TODO el contenido de [`supabase/schema.sql`](./supabase/schema.sql).
   - Crea tablas `barbers`, `services`, `schedules`, `blocked_slots`, `appointments`, `payment_methods`.
   - Habilita RLS y crea políticas.
   - Crea buckets `avatars` y `comprobantes` (públicos).
   - Activa Realtime para `appointments`.

### 2.3. Configurar Google OAuth en Supabase
1. En Supabase: **Authentication → Providers → Google → enable**.
2. Necesitas un **Client ID** y **Client Secret** de Google Cloud Console:
   - Entra a https://console.cloud.google.com
   - Crea un proyecto (o usa uno existente)
   - **APIs & Services → OAuth consent screen** → completa los datos básicos (usuario externo)
   - **APIs & Services → Credentials → Create credentials → OAuth client ID**
     - Tipo: **Web application**
     - **Authorized redirect URIs**: pega aquí la URL que Supabase muestra
       (algo como `https://YOUR-PROJECT.supabase.co/auth/v1/callback`)
   - Copia el **Client ID** y **Client Secret** y pégalos en Supabase.
3. Guarda. ¡Listo!

---

## 3. Variables de entorno

Crea `.env.local` en la raíz (copia desde `.env.example`):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 4. Instalar y correr en local

```bash
npm install
npm run dev
```

Abre http://localhost:3000

### Flujo de prueba
1. Click **Continuar con Google** → inicias sesión.
2. Se abre **Onboarding** → eliges tu username (ej: `joserod`).
3. Llegas al **Dashboard**:
   - Configura tu **Perfil** (foto, descripción, intervalo de 30 o 45 min).
   - Crea **Servicios** (corte, barba, etc.) con precio y duración.
   - Activa tu **Horario** semanal.
   - Añade tus **Métodos de pago** (Pago Móvil, transferencia, efectivo).
4. Comparte tu link: `http://localhost:3000/joserod`
5. Como cliente: elige día/hora → datos → sube comprobante → la cita aparece en tu dashboard **en tiempo real**.

---

## 5. Deploy a Vercel

1. Sube el repo a GitHub.
2. En Vercel: **New Project → Import** tu repo.
3. **Environment Variables**: añade las 3 variables del paso 3
   (cambiando `NEXT_PUBLIC_SITE_URL` a tu dominio de Vercel, ej `https://barberstudio.vercel.app`).
4. Deploy.
5. **Actualiza el redirect URI en Google Cloud Console** añadiendo `https://TU-DOMINIO.vercel.app/auth/callback`.
6. **En Supabase → Authentication → URL Configuration**:
   - **Site URL**: `https://TU-DOMINIO.vercel.app`
   - **Redirect URLs**: añade `https://TU-DOMINIO.vercel.app/auth/callback`

---

## 6. Estructura del proyecto

```
src/
├─ app/
│  ├─ page.tsx                    # Landing
│  ├─ login/page.tsx              # Login con Google
│  ├─ onboarding/                 # Primer login: crea perfil
│  ├─ auth/
│  │  ├─ callback/route.ts        # OAuth callback
│  │  └─ signout/route.ts
│  ├─ dashboard/                  # Área privada del barbero
│  │  ├─ layout.tsx               # Sidebar + tab bar
│  │  ├─ page.tsx                 # Agenda con realtime
│  │  ├─ perfil/
│  │  ├─ servicios/
│  │  ├─ horarios/
│  │  └─ pagos/
│  └─ [username]/                 # Página pública de reservas
│     ├─ page.tsx
│     ├─ BookingFlow.tsx          # 3 pasos
│     ├─ IOSCalendar.tsx
│     └─ PaymentInfoCard.tsx
├─ components/
│  ├─ auth/GoogleSignInButton.tsx
│  ├─ dashboard/DashboardShell.tsx
│  └─ ui/                         # BottomSheet, Switch, Toast, PageHeader
├─ lib/
│  ├─ supabase/                   # client, server, middleware
│  ├─ types.ts
│  └─ time.ts
└─ middleware.ts                  # Refresca sesión
supabase/
└─ schema.sql                     # Esquema completo + RLS + Storage
```

---

## 7. Tablas de la base de datos

| Tabla | Descripción |
|---|---|
| `barbers` | Perfil del barbero (username único, foto, intervalo 30/45 min) |
| `services` | Servicios con nombre, precio, duración |
| `schedules` | Horario semanal (0=Dom … 6=Sáb) |
| `blocked_slots` | Días/horas bloqueadas |
| `appointments` | Citas (status: `pending` / `confirmed` / `cancelled`) |
| `payment_methods` | Pago Móvil, transferencia, efectivo (datos jsonb) |

**RLS habilitado** en todas. Lectura pública para datos de barberos/servicios/horarios/pagos; escritura solo del dueño. Las citas pueden ser **creadas** por cualquiera (clientes anónimos) pero solo el barbero dueño las **lee/edita**.

---

## 8. Estética iOS / Apple

- Fuente: **SF Pro / system-ui**
- Paleta: negro `#000`, superficies `#1C1C1E`/`#2C2C2E`, dorado `#C9A84C`
- Componentes: pill buttons, cards `rounded-ios` (16–22px), `ios-glass` con `backdrop-filter: blur(20px)`
- Tab bar inferior en mobile, sidebar limpio en desktop
- Bottom sheets con animación spring
- Calendario nativo iOS: días en círculos, hoy con borde dorado, seleccionado con relleno dorado
- Sin sombras duras, sin neón, sin animaciones bruscas

---

## 9. Costos

| Servicio | Plan | Costo |
|---|---|---|
| Vercel | Hobby | **$0** |
| Supabase | Free | **$0** (500MB DB, 1GB Storage, 50k MAU) |
| Google OAuth | — | **$0** |
| Total | | **$0/mes** |

---

## 10. Comandos útiles

```bash
npm run dev      # Desarrollo
npm run build    # Build de producción
npm run start    # Servir build
npm run lint     # Lint
```

---

Hecho con ♥ para los barberos de Venezuela.
