-- =====================================================================
-- BARBER STUDIO - Esquema completo de Supabase
-- Ejecutar en: SQL Editor de tu proyecto Supabase
-- =====================================================================

-- Extensiones
create extension if not exists "pgcrypto";

-- =====================================================================
-- TABLA: barbers (perfil del barbero / estudio)
-- =====================================================================
create table if not exists public.barbers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  username text not null unique,
  nombre text not null,
  foto_url text,
  descripcion text,
  intervalo_minutos int not null default 30 check (intervalo_minutos in (30, 45)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_barbers_username on public.barbers(username);
create index if not exists idx_barbers_user_id on public.barbers(user_id);

-- =====================================================================
-- TABLA: services
-- =====================================================================
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  barber_id uuid not null references public.barbers(id) on delete cascade,
  nombre text not null,
  precio numeric(10,2) not null default 0,
  duracion_min int not null default 30,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_services_barber on public.services(barber_id);

-- =====================================================================
-- TABLA: schedules (horario semanal)
-- dia_semana: 0=Domingo .. 6=Sábado
-- =====================================================================
create table if not exists public.schedules (
  id uuid primary key default gen_random_uuid(),
  barber_id uuid not null references public.barbers(id) on delete cascade,
  dia_semana int not null check (dia_semana between 0 and 6),
  hora_inicio time not null,
  hora_fin time not null,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_schedules_barber on public.schedules(barber_id);

-- =====================================================================
-- TABLA: blocked_slots
-- =====================================================================
create table if not exists public.blocked_slots (
  id uuid primary key default gen_random_uuid(),
  barber_id uuid not null references public.barbers(id) on delete cascade,
  fecha date not null,
  hora_inicio time not null,
  hora_fin time not null,
  motivo text,
  created_at timestamptz not null default now()
);
create index if not exists idx_blocked_barber_fecha on public.blocked_slots(barber_id, fecha);

-- =====================================================================
-- TABLA: appointments
-- =====================================================================
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  barber_id uuid not null references public.barbers(id) on delete cascade,
  service_id uuid references public.services(id) on delete set null,
  cliente_nombre text not null,
  cliente_telefono text not null,
  fecha date not null,
  hora time not null,
  status text not null default 'pending' check (status in ('pending','confirmed','cancelled')),
  comprobante_url text,
  notas text,
  created_at timestamptz not null default now()
);
create index if not exists idx_appointments_barber on public.appointments(barber_id);
create index if not exists idx_appointments_fecha on public.appointments(barber_id, fecha);

-- =====================================================================
-- TABLA: payment_methods
-- =====================================================================
create table if not exists public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  barber_id uuid not null references public.barbers(id) on delete cascade,
  tipo text not null check (tipo in ('pago_movil','transferencia','efectivo')),
  datos jsonb not null default '{}'::jsonb,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_payments_barber on public.payment_methods(barber_id);

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================
alter table public.barbers enable row level security;
alter table public.services enable row level security;
alter table public.schedules enable row level security;
alter table public.blocked_slots enable row level security;
alter table public.appointments enable row level security;
alter table public.payment_methods enable row level security;

-- ---------- barbers ----------
drop policy if exists "barbers public read" on public.barbers;
create policy "barbers public read"
  on public.barbers for select
  using (true);

drop policy if exists "barbers owner insert" on public.barbers;
create policy "barbers owner insert"
  on public.barbers for insert
  with check (auth.uid() = user_id);

drop policy if exists "barbers owner update" on public.barbers;
create policy "barbers owner update"
  on public.barbers for update
  using (auth.uid() = user_id);

drop policy if exists "barbers owner delete" on public.barbers;
create policy "barbers owner delete"
  on public.barbers for delete
  using (auth.uid() = user_id);

-- ---------- services ----------
drop policy if exists "services public read" on public.services;
create policy "services public read"
  on public.services for select using (true);

drop policy if exists "services owner all" on public.services;
create policy "services owner all"
  on public.services for all
  using (exists (select 1 from public.barbers b where b.id = barber_id and b.user_id = auth.uid()))
  with check (exists (select 1 from public.barbers b where b.id = barber_id and b.user_id = auth.uid()));

-- ---------- schedules ----------
drop policy if exists "schedules public read" on public.schedules;
create policy "schedules public read"
  on public.schedules for select using (true);

drop policy if exists "schedules owner all" on public.schedules;
create policy "schedules owner all"
  on public.schedules for all
  using (exists (select 1 from public.barbers b where b.id = barber_id and b.user_id = auth.uid()))
  with check (exists (select 1 from public.barbers b where b.id = barber_id and b.user_id = auth.uid()));

-- ---------- blocked_slots ----------
drop policy if exists "blocked public read" on public.blocked_slots;
create policy "blocked public read"
  on public.blocked_slots for select using (true);

drop policy if exists "blocked owner all" on public.blocked_slots;
create policy "blocked owner all"
  on public.blocked_slots for all
  using (exists (select 1 from public.barbers b where b.id = barber_id and b.user_id = auth.uid()))
  with check (exists (select 1 from public.barbers b where b.id = barber_id and b.user_id = auth.uid()));

-- ---------- payment_methods ----------
drop policy if exists "payments public read" on public.payment_methods;
create policy "payments public read"
  on public.payment_methods for select using (true);

drop policy if exists "payments owner all" on public.payment_methods;
create policy "payments owner all"
  on public.payment_methods for all
  using (exists (select 1 from public.barbers b where b.id = barber_id and b.user_id = auth.uid()))
  with check (exists (select 1 from public.barbers b where b.id = barber_id and b.user_id = auth.uid()));

-- ---------- appointments ----------
-- Cualquiera puede CREAR una cita (cliente reservando), pero leer/editar solo el barbero dueño
drop policy if exists "appointments public insert" on public.appointments;
create policy "appointments public insert"
  on public.appointments for insert
  with check (true);

drop policy if exists "appointments owner select" on public.appointments;
create policy "appointments owner select"
  on public.appointments for select
  using (exists (select 1 from public.barbers b where b.id = barber_id and b.user_id = auth.uid()));

drop policy if exists "appointments owner update" on public.appointments;
create policy "appointments owner update"
  on public.appointments for update
  using (exists (select 1 from public.barbers b where b.id = barber_id and b.user_id = auth.uid()));

drop policy if exists "appointments owner delete" on public.appointments;
create policy "appointments owner delete"
  on public.appointments for delete
  using (exists (select 1 from public.barbers b where b.id = barber_id and b.user_id = auth.uid()));

-- =====================================================================
-- STORAGE BUCKETS
-- Ejecutar también en SQL Editor
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('comprobantes', 'comprobantes', true)
on conflict (id) do nothing;

-- Policies de storage: lectura pública, escritura libre para clientes (comprobantes)
drop policy if exists "avatars public read" on storage.objects;
create policy "avatars public read"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "avatars auth write" on storage.objects;
create policy "avatars auth write"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

drop policy if exists "avatars auth update" on storage.objects;
create policy "avatars auth update"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.role() = 'authenticated');

drop policy if exists "comprobantes public read" on storage.objects;
create policy "comprobantes public read"
  on storage.objects for select
  using (bucket_id = 'comprobantes');

drop policy if exists "comprobantes public write" on storage.objects;
create policy "comprobantes public write"
  on storage.objects for insert
  with check (bucket_id = 'comprobantes');

-- =====================================================================
-- REALTIME: habilitar publicación para la tabla appointments
-- =====================================================================
alter publication supabase_realtime add table public.appointments;
