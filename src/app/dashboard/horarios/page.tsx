import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import HorariosClient from './HorariosClient';
import { LockedFeature } from '@/components/LockedFeature';

export const dynamic = 'force-dynamic';

export default async function HorariosPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, subscription_status')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!profile) redirect('/onboarding');

  if (profile.subscription_status !== 'active') {
    return <LockedFeature title="Horarios" desc="Activa tu suscripción para configurar tus horarios de atención." />;
  }

  const [{ data: schedules }, { data: blocked }] = await Promise.all([
    supabase.from('schedules').select('*').eq('profile_id', profile.id),
    supabase.from('blocked_slots').select('*').eq('profile_id', profile.id).gte('fecha', new Date().toISOString().split('T')[0]).order('fecha'),
  ]);

  return <HorariosClient profileId={profile.id} initialSchedules={schedules || []} initialBlocked={blocked || []} />;
}
