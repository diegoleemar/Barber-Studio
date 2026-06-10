import { createClient } from '@/lib/supabase/server';
import HorariosClient from './HorariosClient';

export const dynamic = 'force-dynamic';

export default async function HorariosPage() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: barber } = await supabase
    .from('barbers')
    .select('id')
    .eq('user_id', user!.id)
    .maybeSingle();

  if (!barber) return null;

  const [{ data: schedules }, { data: blocked }] = await Promise.all([
    supabase.from('schedules').select('*').eq('barber_id', barber.id),
    supabase
      .from('blocked_slots')
      .select('*')
      .eq('barber_id', barber.id)
      .gte('fecha', new Date().toISOString().split('T')[0])
      .order('fecha')
  ]);

  return (
    <HorariosClient
      barberId={barber.id}
      initialSchedules={schedules || []}
      initialBlocked={blocked || []}
    />
  );
}
