import { createClient } from '@/lib/supabase/server';
import PerfilForm from './PerfilForm';

export const dynamic = 'force-dynamic';

export default async function PerfilPage() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, profession:professions(*)')
    .eq('user_id', user!.id)
    .maybeSingle();

  if (!profile) return null;

  return <PerfilForm profile={profile} />;
}
