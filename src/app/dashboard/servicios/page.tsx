import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ServiciosClient from './ServiciosClient';
import { LockedFeature } from '@/components/LockedFeature';

export const dynamic = 'force-dynamic';

export default async function ServiciosPage() {
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
    return <LockedFeature title="Servicios" desc="Activa tu suscripción para configurar tus servicios y precios." />;
  }

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('profile_id', profile.id)
    .order('sort_order');

  return <ServiciosClient profileId={profile.id} initial={services || []} />;
}
