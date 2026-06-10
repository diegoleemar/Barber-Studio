import { createClient } from '@/lib/supabase/server';
import AgendaView from './AgendaView';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
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
    .eq('barber_id', barber.id);

  return <AgendaView barberId={barber.id} services={services || []} />;
}
