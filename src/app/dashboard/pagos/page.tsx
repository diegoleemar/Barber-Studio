import { createClient } from '@/lib/supabase/server';
import PagosClient from './PagosClient';

export const dynamic = 'force-dynamic';

export default async function PagosPage() {
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

  const { data: methods } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('barber_id', barber.id)
    .order('created_at');

  return <PagosClient barberId={barber.id} initial={methods || []} />;
}
