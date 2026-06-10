import { createClient } from '@/lib/supabase/server';
import ServiciosClient from './ServiciosClient';

export const dynamic = 'force-dynamic';

export default async function ServiciosPage() {
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

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('barber_id', barber.id)
    .order('created_at');

  return <ServiciosClient barberId={barber.id} initial={services || []} />;
}
