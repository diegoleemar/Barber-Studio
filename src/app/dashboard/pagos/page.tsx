import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import PagosClient from './PagosClient';
import { LockedFeature } from '@/components/LockedFeature';

export const dynamic = 'force-dynamic';

export default async function PagosPage() {
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
    return <LockedFeature title="Métodos de pago" desc="Activa tu suscripción para configurar tus métodos de pago." />;
  }

  const { data: payments } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('profile_id', profile.id);

  return <PagosClient profileId={profile.id} initial={payments || []} />;
}
