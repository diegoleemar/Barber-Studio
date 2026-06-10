import { createClient } from '@/lib/supabase/server';
import PerfilForm from './PerfilForm';

export const dynamic = 'force-dynamic';

export default async function PerfilPage() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: barber } = await supabase
    .from('barbers')
    .select('*')
    .eq('user_id', user!.id)
    .maybeSingle();

  if (!barber) return null;

  return <PerfilForm barber={barber} />;
}
