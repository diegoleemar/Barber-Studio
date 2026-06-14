// ─── Enums ───
export type BookingFlowType = 'interval' | 'block' | 'home_service';

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled';

export type AppointmentType = 'in_person' | 'online' | 'home_service';

export type PaymentType = 'pago_movil' | 'transferencia' | 'efectivo' | 'binance' | 'paypal' | 'zelle';

export type SubscriptionStatus = 'inactive' | 'active' | 'expired';

export type SubscriptionPlan = 'individual' | 'business';

// ─── Industrias ───
export interface Industry {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

// ─── Profesiones ───
export interface Profession {
  id: string;
  industry_id: string;
  slug: string;
  name: string;
  booking_flow_type: BookingFlowType;
  default_interval: number;
  min_duration: number;
  max_duration: number;
  requires_deposit: boolean;
  supports_online: boolean;
  icon: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  // Joined
  industry?: Industry;
}

// ─── Perfil (reemplaza a Barber) ───
export interface Profile {
  id: string;
  user_id: string;
  username: string;
  profession_id: string;
  business_name: string;
  description: string | null;
  photo_url: string | null;
  phone: string | null;
  address: string | null;
  service_zone: string[];
  custom_fields: Record<string, unknown>;
  subscription_status: SubscriptionStatus;
  subscription_plan: SubscriptionPlan | null;
  created_at: string;
  updated_at: string;
  // Joined
  profession?: Profession;
}

// ─── Categorías de servicios ───
export interface ServiceCategory {
  id: string;
  profile_id: string;
  name: string;
  description: string | null;
  sort_order: number;
  created_at: string;
}

// ─── Servicios ───
export interface Service {
  id: string;
  profile_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  duration_min: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  // Joined
  category?: ServiceCategory;
}

// ─── Horarios ───
export interface Schedule {
  id: string;
  profile_id: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  is_active: boolean;
  created_at: string;
}

// ─── Bloques bloqueados ───
export interface BlockedSlot {
  id: string;
  profile_id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  motivo: string | null;
  created_at: string;
}

// ─── Citas ───
export interface Appointment {
  id: string;
  profile_id: string;
  service_id: string | null;
  cliente_nombre: string;
  cliente_telefono: string;
  fecha: string;
  hora: string;
  status: AppointmentStatus;
  appointment_type: AppointmentType;
  address: string | null;
  notes: string | null;
  comprobante_url: string | null;
  created_at: string;
  // Joined
  service?: Service;
  profile?: Profile;
}

// ─── Métodos de pago ───
export interface PaymentMethod {
  id: string;
  profile_id: string;
  tipo: PaymentType;
  datos: Record<string, string>;
  is_active: boolean;
  created_at: string;
}

// ─── Solicitudes de pago ───
export interface PaymentRequest {
  id: string;
  profile_id: string;
  plan: SubscriptionPlan;
  billing_months: number;
  metodo: string;
  monto: number;
  referencia: string | null;
  comprobante_url: string | null;
  status: 'pending' | 'verified' | 'rejected';
  notas_admin: string | null;
  created_at: string;
  verified_at: string | null;
  profile?: Profile;
}

// ─── Configuración de plataforma ───
export interface PlatformConfig {
  id: string;
  pago_movil: { banco: string; telefono: string; titular: string };
  transferencia: { banco: string; cuenta: string; titular: string };
  binancepay: { correo: string; id_usuario: string };
  updated_at: string;
}

// ─── Tipo helper para el scheduler dinámico ───
export interface SlotConfig {
  flowType: BookingFlowType;
  interval: number;
  minDuration: number;
  maxDuration: number;
  requiresDeposit: boolean;
  supportsOnline: boolean;
}
