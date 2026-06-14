-- =====================================================================
-- GOCLIENT - Migración v2: Multi-industria
-- Ejecutar en: SQL Editor de tu proyecto Supabase
-- =====================================================================
-- ATENCIÓN: Esta migración renombra las tablas existentes a _old
-- y crea las nuevas. Los datos se migran automáticamente.
-- Las tablas _old se pueden eliminar después de verificar.
-- =====================================================================

-- =====================================================================
-- 0. RENOMBRAR tablas existentes (para evitar conflictos)
-- =====================================================================
alter table if exists public.barbers          rename to _barbers_old;
alter table if exists public.services         rename to _services_old;
alter table if exists public.schedules        rename to _schedules_old;
alter table if exists public.blocked_slots    rename to _blocked_slots_old;
alter table if exists public.appointments     rename to _appointments_old;
alter table if exists public.payment_methods  rename to _payment_methods_old;
alter table if exists public.payment_requests rename to _payment_requests_old;

-- Drop RLS policies de las tablas viejas (se van con el rename, pero por seguridad)
do $$ begin
  execute 'drop policy if exists "barbers public read" on public._barbers_old';
  execute 'drop policy if exists "services public read" on public._services_old';
  -- ... el rename ya las desasocia, pero limpiamos igual
exception when others then null; end $$;

-- =====================================================================
-- 1. TABLA: industries (6 macro-grupos)
-- =====================================================================
create table if not exists public.industries (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  description text,
  icon        text,
  color       text,
  is_active   boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- =====================================================================
-- 2. TABLA: professions (30+ profesiones específicas)
-- =====================================================================
create table if not exists public.professions (
  id                uuid primary key default gen_random_uuid(),
  industry_id       uuid not null references public.industries(id),
  slug              text not null unique,
  name              text not null,
  booking_flow_type text not null check (booking_flow_type in ('interval','block','home_service')),
  default_interval  int not null default 30,
  min_duration      int not null default 15,
  max_duration      int not null default 480,
  requires_deposit  boolean not null default false,
  supports_online   boolean not null default false,
  icon              text,
  is_active         boolean not null default true,
  sort_order        int not null default 0,
  created_at        timestamptz not null default now()
);
create index if not exists idx_professions_industry on public.professions(industry_id);

-- =====================================================================
-- 3. TABLA: profiles (reemplaza a barbers)
-- =====================================================================
create table if not exists public.profiles (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null unique references auth.users(id) on delete cascade,
  username            text not null unique,
  profession_id       uuid not null references public.professions(id),
  business_name       text not null,
  description         text,
  photo_url           text,
  phone               text,
  address             text,
  service_zone        jsonb not null default '[]'::jsonb,
  custom_fields       jsonb not null default '{}'::jsonb,
  subscription_status text not null default 'inactive' check (subscription_status in ('inactive','active','expired')),
  subscription_plan   text check (subscription_plan in ('individual','business')),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index if not exists idx_profiles_username on public.profiles(username);
create index if not exists idx_profiles_user_id on public.profiles(user_id);
create index if not exists idx_profiles_profession on public.profiles(profession_id);

-- =====================================================================
-- 4. TABLA: service_categories (agrupación de servicios)
-- =====================================================================
create table if not exists public.service_categories (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  name        text not null,
  description text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists idx_service_categories_profile on public.service_categories(profile_id);

-- =====================================================================
-- 5. TABLA: services (nueva)
-- =====================================================================
create table if not exists public.services (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid not null references public.profiles(id) on delete cascade,
  category_id  uuid references public.service_categories(id) on delete set null,
  name         text not null,
  description  text,
  price        numeric(10,2) not null default 0,
  duration_min int not null default 30,
  is_active    boolean not null default true,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now()
);
create index if not exists idx_services_profile on public.services(profile_id);

-- =====================================================================
-- 6. TABLA: schedules (nueva)
-- =====================================================================
create table if not exists public.schedules (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  dia_semana  int not null check (dia_semana between 0 and 6),
  hora_inicio time not null,
  hora_fin    time not null,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);
create index if not exists idx_schedules_profile on public.schedules(profile_id);

-- =====================================================================
-- 7. TABLA: blocked_slots (nueva)
-- =====================================================================
create table if not exists public.blocked_slots (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  fecha       date not null,
  hora_inicio time not null,
  hora_fin    time not null,
  motivo      text,
  created_at  timestamptz not null default now()
);
create index if not exists idx_blocked_profile_fecha on public.blocked_slots(profile_id, fecha);

-- =====================================================================
-- 8. TABLA: appointments (nueva con appointment_type)
-- =====================================================================
create table if not exists public.appointments (
  id               uuid primary key default gen_random_uuid(),
  profile_id       uuid not null references public.profiles(id) on delete cascade,
  service_id       uuid references public.services(id) on delete set null,
  cliente_nombre   text not null,
  cliente_telefono text not null,
  fecha            date not null,
  hora             time not null,
  status           text not null default 'pending' check (status in ('pending','confirmed','cancelled')),
  appointment_type text not null default 'in_person' check (appointment_type in ('in_person','online','home_service')),
  address          text,
  notes            text,
  comprobante_url  text,
  created_at       timestamptz not null default now()
);
create index if not exists idx_appointments_profile on public.appointments(profile_id);
create index if not exists idx_appointments_fecha on public.appointments(profile_id, fecha);

-- =====================================================================
-- 9. TABLA: payment_methods (nueva)
-- =====================================================================
create table if not exists public.payment_methods (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  tipo       text not null check (tipo in ('pago_movil','transferencia','efectivo','binance','paypal','zelle')),
  datos      jsonb not null default '{}'::jsonb,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_payments_profile on public.payment_methods(profile_id);

-- =====================================================================
-- 10. TABLA: payment_requests (nueva)
-- =====================================================================
create table if not exists public.payment_requests (
  id              uuid primary key default gen_random_uuid(),
  profile_id      uuid not null references public.profiles(id) on delete cascade,
  plan            text not null check (plan in ('individual','business')),
  metodo          text not null,
  monto           numeric(10,2) not null,
  referencia      text,
  comprobante_url text,
  status          text not null default 'pending' check (status in ('pending','verified','rejected')),
  notas_admin     text,
  created_at      timestamptz not null default now(),
  verified_at     timestamptz
);
create index if not exists idx_payment_requests_profile on public.payment_requests(profile_id);
create index if not exists idx_payment_requests_status on public.payment_requests(status);

-- =====================================================================
-- 11. SEED DATA: Industries
-- =====================================================================
insert into public.industries (slug, name, description, icon, color, sort_order) values
  ('estetica',           'Estética y Cuidado Personal', 'Barberos, manicuristas, maquilladores, lashistas, masajistas', 'Sparkles', '#EC4899', 1),
  ('salud',              'Salud y Medicina', 'Médicos, odontólogos, psicólogos, nutricionistas, fisioterapeutas, veterinarios', 'HeartPulse', '#06B6D4', 2),
  ('arte',               'Arte y Entretenimiento', 'Tatuadores, productores musicales, fotógrafos, academias, músicos', 'Palette', '#F59E0B', 3),
  ('fitness',            'Fitness y Deportes', 'Entrenadores personales, instructores de yoga, pilates, crossfit', 'Dumbbell', '#22C55E', 4),
  ('servicios_tecnicos', 'Servicios Técnicos', 'Técnicos de refrigeración, mecánicos, reparación de celulares, limpieza', 'Wrench', '#63636E', 5),
  ('asesoria',           'Asesoría Profesional', 'Abogados, contadores, asesores de seguros, consultores', 'Briefcase', '#8B5CF6', 6)
on conflict (slug) do nothing;

-- =====================================================================
-- 12. SEED DATA: Professions (30+)
-- =====================================================================
do $$
declare
  v_estetica_id           uuid;
  v_salud_id              uuid;
  v_arte_id               uuid;
  v_fitness_id            uuid;
  v_servicios_tecnicos_id uuid;
  v_asesoria_id           uuid;
begin
  select id into v_estetica_id           from public.industries where slug = 'estetica';
  select id into v_salud_id              from public.industries where slug = 'salud';
  select id into v_arte_id               from public.industries where slug = 'arte';
  select id into v_fitness_id            from public.industries where slug = 'fitness';
  select id into v_servicios_tecnicos_id from public.industries where slug = 'servicios_tecnicos';
  select id into v_asesoria_id           from public.industries where slug = 'asesoria';

  insert into public.professions (industry_id, slug, name, booking_flow_type, default_interval, min_duration, max_duration, icon, sort_order) values
    (v_estetica_id, 'barbero',            'Barbero',            'interval', 30, 15, 120, 'Scissors', 1),
    (v_estetica_id, 'estilista',          'Estilista / Peluquero', 'interval', 30, 15, 180, 'Scissors', 2),
    (v_estetica_id, 'manicurista',        'Manicurista / Pedicurista', 'interval', 30, 15, 90, 'Hand', 3),
    (v_estetica_id, 'maquillador',        'Maquillador Profesional', 'interval', 45, 30, 180, 'Paintbrush', 4),
    (v_estetica_id, 'lashista',           'Lashista / Cejista', 'interval', 30, 15, 90, 'Eye', 5),
    (v_estetica_id, 'masajista',          'Masajista / Quiropráctico', 'interval', 45, 30, 120, 'Heart', 6),
    (v_estetica_id, 'depilacion',         'Depilación Corporal', 'interval', 30, 15, 90, 'Zap', 7)
  on conflict (slug) do nothing;

  insert into public.professions (industry_id, slug, name, booking_flow_type, default_interval, min_duration, max_duration, supports_online, icon, sort_order) values
    (v_salud_id, 'medico_general',       'Médico General',     'interval', 30, 15, 60, true, 'Stethoscope', 1),
    (v_salud_id, 'medico_especialista',  'Médico Especialista',  'interval', 30, 15, 60, true, 'Microscope', 2),
    (v_salud_id, 'odontologo',           'Odontólogo',         'interval', 45, 30, 120, false, 'Tooth', 3),
    (v_salud_id, 'psicologo',            'Psicólogo / Terapeuta', 'interval', 45, 30, 90, true, 'Brain', 4),
    (v_salud_id, 'nutricionista',        'Nutricionista / Dietista', 'interval', 30, 15, 60, true, 'Apple', 5),
    (v_salud_id, 'fisioterapeuta',       'Fisioterapeuta',     'home_service', 45, 30, 120, false, 'Bone', 6),
    (v_salud_id, 'veterinario',          'Veterinario',        'interval', 30, 15, 60, false, 'Cat', 7)
  on conflict (slug) do nothing;

  insert into public.professions (industry_id, slug, name, booking_flow_type, default_interval, min_duration, max_duration, requires_deposit, icon, sort_order) values
    (v_arte_id, 'productor_musical',     'Productor Musical / Estudio', 'block', 120, 60, 480, true, 'Music', 1),
    (v_arte_id, 'tatuador',              'Tatuador / Piercing',  'block', 120, 60, 480, true, 'Droplet', 2),
    (v_arte_id, 'fotografo',             'Fotógrafo / Videógrafo', 'block', 60, 30, 360, true, 'Camera', 3),
    (v_arte_id, 'academia',              'Academia / Profesor Particular', 'interval', 60, 30, 180, false, 'GraduationCap', 4)
  on conflict (slug) do nothing;

  insert into public.professions (industry_id, slug, name, booking_flow_type, default_interval, min_duration, max_duration, supports_online, icon, sort_order) values
    (v_fitness_id, 'entrenador_personal', 'Entrenador Personal', 'home_service', 45, 30, 120, true, 'Dumbbell', 1),
    (v_fitness_id, 'instructor_yoga',    'Instructor de Yoga / Pilates', 'interval', 45, 30, 90, true, 'Leaf', 2),
    (v_fitness_id, 'instructor_crossfit','Instructor de Crossfit', 'interval', 45, 30, 90, false, 'Zap', 3)
  on conflict (slug) do nothing;

  insert into public.professions (industry_id, slug, name, booking_flow_type, default_interval, min_duration, max_duration, icon, sort_order) values
    (v_servicios_tecnicos_id, 'tecnico_refrigeracion', 'Técnico Refrigeración / A/A', 'home_service', 60, 30, 240, 'Wind', 1),
    (v_servicios_tecnicos_id, 'mecanico',           'Mecánico Automotriz',  'home_service', 60, 30, 480, 'Car', 2),
    (v_servicios_tecnicos_id, 'tecnico_computacion', 'Técnico Computación / Celulares', 'home_service', 45, 30, 120, 'Monitor', 3),
    (v_servicios_tecnicos_id, 'car_wash',            'Car Wash / Detallado', 'block', 60, 30, 240, 'SprayCan', 4),
    (v_servicios_tecnicos_id, 'limpieza',            'Servicio de Limpieza', 'home_service', 120, 60, 480, 'Broom', 5)
  on conflict (slug) do nothing;

  insert into public.professions (industry_id, slug, name, booking_flow_type, default_interval, min_duration, max_duration, supports_online, icon, sort_order) values
    (v_asesoria_id, 'abogado',            'Abogado',            'interval', 30, 15, 90, true, 'Scale', 1),
    (v_asesoria_id, 'contador',           'Contador',           'interval', 30, 15, 90, true, 'Calculator', 2),
    (v_asesoria_id, 'asesor_seguros',     'Asesor de Seguros',  'interval', 30, 15, 60, true, 'Shield', 3)
  on conflict (slug) do nothing;
end $$;

-- =====================================================================
-- 13. MIGRACIÓN: Datos existentes desde tablas _old
-- =====================================================================
do $$
declare
  v_barber_profession_id uuid;
  v_count int;
  v_profile_id uuid;
  v_old_profile_id uuid;
begin
  select id into v_barber_profession_id from public.professions where slug = 'barbero';

  -- Migrar barbers → profiles
  insert into public.profiles (
    user_id, username, business_name, description, photo_url,
    subscription_status, subscription_plan, profession_id,
    custom_fields, created_at, updated_at
  )
  select
    b.user_id, b.username, b.nombre, b.descripcion, b.foto_url,
    coalesce(b.subscription_status, 'inactive'),
    case when b.subscription_plan = 'barbero' then 'individual'
         when b.subscription_plan = 'barberia' then 'business'
         else null end,
    v_barber_profession_id,
    '{"migrated_from_barbers": true}'::jsonb,
    b.created_at, b.updated_at
  from public._barbers_old b
  where not exists (select 1 from public.profiles p where p.user_id = b.user_id);
  get diagnostics v_count = row_count;
  raise notice 'Migrados % barberos a profiles', v_count;

  -- Migrar services → services
  for v_old_profile_id, v_profile_id in
    select b.id, p.id from public._barbers_old b join public.profiles p on p.user_id = b.user_id
  loop
    insert into public.services (profile_id, name, price, duration_min, is_active, created_at)
    select v_profile_id, s.nombre, s.precio, s.duracion_min, s.activo, s.created_at
    from public._services_old s where s.barber_id = v_old_profile_id
    and not exists (select 1 from public.services ns where ns.id = s.id);
  end loop;
  get diagnostics v_count = row_count;
  raise notice 'Migrados % servicios', v_count;

  -- Migrar schedules
  for v_old_profile_id, v_profile_id in
    select b.id, p.id from public._barbers_old b join public.profiles p on p.user_id = b.user_id
  loop
    insert into public.schedules (profile_id, dia_semana, hora_inicio, hora_fin, is_active, created_at)
    select v_profile_id, s.dia_semana, s.hora_inicio, s.hora_fin, s.activo, s.created_at
    from public._schedules_old s where s.barber_id = v_old_profile_id
    and not exists (select 1 from public.schedules ns where ns.id = s.id);
  end loop;

  -- Migrar blocked_slots
  for v_old_profile_id, v_profile_id in
    select b.id, p.id from public._barbers_old b join public.profiles p on p.user_id = b.user_id
  loop
    insert into public.blocked_slots (profile_id, fecha, hora_inicio, hora_fin, motivo, created_at)
    select v_profile_id, b.fecha, b.hora_inicio, b.hora_fin, b.motivo, b.created_at
    from public._blocked_slots_old b where b.barber_id = v_old_profile_id
    and not exists (select 1 from public.blocked_slots nb where nb.id = b.id);
  end loop;

  -- Migrar appointments
  for v_old_profile_id, v_profile_id in
    select b.id, p.id from public._barbers_old b join public.profiles p on p.user_id = b.user_id
  loop
    insert into public.appointments (profile_id, service_id, cliente_nombre, cliente_telefono, fecha, hora, status, comprobante_url, notes, created_at)
    select v_profile_id, a.service_id, a.cliente_nombre, a.cliente_telefono, a.fecha, a.hora, a.status, a.comprobante_url, a.notas, a.created_at
    from public._appointments_old a where a.barber_id = v_old_profile_id
    and not exists (select 1 from public.appointments na where na.id = a.id);
  end loop;

  -- Migrar payment_methods
  for v_old_profile_id, v_profile_id in
    select b.id, p.id from public._barbers_old b join public.profiles p on p.user_id = b.user_id
  loop
    insert into public.payment_methods (profile_id, tipo, datos, is_active, created_at)
    select v_profile_id, p.tipo, p.datos, p.activo, p.created_at
    from public._payment_methods_old p where p.barber_id = v_old_profile_id
    and not exists (select 1 from public.payment_methods np where np.id = p.id);
  end loop;

  -- Migrar payment_requests
  for v_old_profile_id, v_profile_id in
    select b.id, p.id from public._barbers_old b join public.profiles p on p.user_id = b.user_id
  loop
    insert into public.payment_requests (profile_id, plan, metodo, monto, referencia, comprobante_url, status, notas_admin, created_at, verified_at)
    select v_profile_id,
      case when pr.plan = 'barbero' then 'individual' when pr.plan = 'barberia' then 'business' else 'individual' end,
      pr.metodo, pr.monto, pr.referencia, pr.comprobante_url, pr.status, pr.notas_admin, pr.created_at, pr.verified_at
    from public._payment_requests_old pr where pr.barber_id = v_old_profile_id
    and not exists (select 1 from public.payment_requests npr where npr.id = pr.id);
  end loop;
end $$;

-- =====================================================================
-- 14. ROW LEVEL SECURITY - Nuevas tablas
-- =====================================================================
alter table public.industries enable row level security;
alter table public.professions enable row level security;
alter table public.profiles enable row level security;
alter table public.service_categories enable row level security;
alter table public.services enable row level security;
alter table public.schedules enable row level security;
alter table public.blocked_slots enable row level security;
alter table public.appointments enable row level security;
alter table public.payment_methods enable row level security;
alter table public.payment_requests enable row level security;

drop policy if exists "industries public read" on public.industries;
create policy "industries public read"
  on public.industries for select using (true);

drop policy if exists "professions public read" on public.professions;
create policy "professions public read"
  on public.professions for select using (true);

drop policy if exists "profiles public read" on public.profiles;
create policy "profiles public read"
  on public.profiles for select using (true);

drop policy if exists "profiles owner insert" on public.profiles;
create policy "profiles owner insert"
  on public.profiles for insert with check (auth.uid() = user_id);

drop policy if exists "profiles owner update" on public.profiles;
create policy "profiles owner update"
  on public.profiles for update using (auth.uid() = user_id);

drop policy if exists "profiles owner delete" on public.profiles;
create policy "profiles owner delete"
  on public.profiles for delete using (auth.uid() = user_id);

drop policy if exists "service_categories public read" on public.service_categories;
create policy "service_categories public read"
  on public.service_categories for select using (true);

drop policy if exists "service_categories owner all" on public.service_categories;
create policy "service_categories owner all"
  on public.service_categories for all
  using (exists (select 1 from public.profiles p where p.id = profile_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.profiles p where p.id = profile_id and p.user_id = auth.uid()));

drop policy if exists "services old" on public.services;
drop policy if exists "services public read" on public.services;
create policy "services public read"
  on public.services for select using (true);

drop policy if exists "services owner all" on public.services;
create policy "services owner all"
  on public.services for all
  using (exists (select 1 from public.profiles p where p.id = profile_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.profiles p where p.id = profile_id and p.user_id = auth.uid()));

drop policy if exists "schedules old" on public.schedules;
drop policy if exists "schedules public read" on public.schedules;
create policy "schedules public read"
  on public.schedules for select using (true);

drop policy if exists "schedules owner all" on public.schedules;
create policy "schedules owner all"
  on public.schedules for all
  using (exists (select 1 from public.profiles p where p.id = profile_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.profiles p where p.id = profile_id and p.user_id = auth.uid()));

drop policy if exists "blocked old" on public.blocked_slots;
drop policy if exists "blocked public read" on public.blocked_slots;
create policy "blocked public read"
  on public.blocked_slots for select using (true);

drop policy if exists "blocked owner all" on public.blocked_slots;
create policy "blocked owner all"
  on public.blocked_slots for all
  using (exists (select 1 from public.profiles p where p.id = profile_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.profiles p where p.id = profile_id and p.user_id = auth.uid()));

drop policy if exists "appointments old" on public.appointments;
drop policy if exists "appointments public insert" on public.appointments;
create policy "appointments public insert"
  on public.appointments for insert with check (true);

drop policy if exists "appointments owner select" on public.appointments;
create policy "appointments owner select"
  on public.appointments for select
  using (exists (select 1 from public.profiles p where p.id = profile_id and p.user_id = auth.uid()));

drop policy if exists "appointments owner update" on public.appointments;
create policy "appointments owner update"
  on public.appointments for update
  using (exists (select 1 from public.profiles p where p.id = profile_id and p.user_id = auth.uid()));

drop policy if exists "appointments owner delete" on public.appointments;
create policy "appointments owner delete"
  on public.appointments for delete
  using (exists (select 1 from public.profiles p where p.id = profile_id and p.user_id = auth.uid()));

drop policy if exists "payments old" on public.payment_methods;
drop policy if exists "payments public read" on public.payment_methods;
create policy "payments public read"
  on public.payment_methods for select using (true);

drop policy if exists "payments owner all" on public.payment_methods;
create policy "payments owner all"
  on public.payment_methods for all
  using (exists (select 1 from public.profiles p where p.id = profile_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.profiles p where p.id = profile_id and p.user_id = auth.uid()));

drop policy if exists "payment_requests old" on public.payment_requests;
drop policy if exists "payment_requests insert own" on public.payment_requests;
create policy "payment_requests insert own"
  on public.payment_requests for insert
  with check (exists (select 1 from public.profiles p where p.id = profile_id and p.user_id = auth.uid()));

drop policy if exists "payment_requests select own" on public.payment_requests;
create policy "payment_requests select own"
  on public.payment_requests for select
  using (exists (select 1 from public.profiles p where p.id = profile_id and p.user_id = auth.uid()));

-- =====================================================================
-- 15. REALTIME: appointments
-- =====================================================================
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'appointments') then
    alter publication supabase_realtime add table public.appointments;
  end if;
end $$;
