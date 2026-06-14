import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AgendaView from './AgendaView';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!profile) return null;

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('profile_id', profile.id);

  return <AgendaView profileId={profile.id} services={services || []} />;
}
