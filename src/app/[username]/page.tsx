import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import BookingFlow from './BookingFlow';

export const dynamic = 'force-dynamic';

const RESERVED = new Set([
  'dashboard',
  'login',
  'onboarding',
  'auth',
  'api',
  'admin',
  'about',
  '_next',
  'favicon.ico'
]);

export default async function PublicBarberPage({
  params
}: {
  params: { username: string };
}) {
  if (RESERVED.has(params.username.toLowerCase())) notFound();

  const supabase = createClient();
  const { data: barber } = await supabase
    .from('barbers')
    .select('*')
    .eq('username', params.username)
    .maybeSingle();

  if (!barber) notFound();

  const [{ data: services }, { data: schedules }, { data: payments }] = await Promise.all([
    supabase
      .from('services')
      .select('*')
      .eq('barber_id', barber.id)
      .eq('activo', true)
      .order('precio'),
    supabase
      .from('schedules')
      .select('*')
      .eq('barber_id', barber.id)
      .eq('activo', true),
    supabase
      .from('payment_methods')
      .select('*')
      .eq('barber_id', barber.id)
      .eq('activo', true)
  ]);

  return (
    <BookingFlow
      barber={barber}
      services={services || []}
      schedules={schedules || []}
      payments={payments || []}
    />
  );
}

export async function generateMetadata({ params }: { params: { username: string } }) {
  if (RESERVED.has(params.username.toLowerCase())) return {};
  const supabase = createClient();
  const { data: barber } = await supabase
    .from('barbers')
    .select('nombre, descripcion')
    .eq('username', params.username)
    .maybeSingle();
  if (!barber) return {};
  return {
    title: `${barber.nombre} — Reserva tu cita`,
    description: barber.descripcion || `Reserva online con ${barber.nombre}`
  };
}
