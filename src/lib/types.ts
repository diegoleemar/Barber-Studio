export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled';
export type PaymentType = 'pago_movil' | 'transferencia' | 'efectivo';

export interface Barber {
  id: string;
  user_id: string;
  username: string;
  nombre: string;
  foto_url: string | null;
  descripcion: string | null;
  intervalo_minutos: 30 | 45 | 60;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  barber_id: string;
  nombre: string;
  precio: number;
  duracion_min: number;
  activo: boolean;
  created_at: string;
}

export interface Schedule {
  id: string;
  barber_id: string;
  dia_semana: number; // 0..6 (Dom..Sáb)
  hora_inicio: string; // "HH:mm:ss"
  hora_fin: string;
  activo: boolean;
  created_at: string;
}

export interface BlockedSlot {
  id: string;
  barber_id: string;
  fecha: string; // YYYY-MM-DD
  hora_inicio: string;
  hora_fin: string;
  motivo: string | null;
  created_at: string;
}

export interface Appointment {
  id: string;
  barber_id: string;
  service_id: string | null;
  cliente_nombre: string;
  cliente_telefono: string;
  fecha: string;
  hora: string;
  status: AppointmentStatus;
  comprobante_url: string | null;
  notas: string | null;
  created_at: string;
}

export interface PaymentMethod {
  id: string;
  barber_id: string;
  tipo: PaymentType;
  datos: Record<string, string>;
  activo: boolean;
  created_at: string;
}
