import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import PagarClient from './PagarClient';

export const dynamic = 'force-dynamic';

export default async function PagarPage({
  searchParams,
}: {
  searchParams: { plan?: string; months?: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!profile) redirect('/onboarding');
  if (profile.subscription_status === 'active') redirect('/dashboard');

  const { data: config } = await supabase
    .from('platform_config')
    .select('*')
    .single();

  const { data: myRequests } = await supabase
    .from('payment_requests')
    .select('*')
    .eq('profile_id', profile.id)
    .order('created_at', { ascending: false });

  return (
    <PagarClient
      profile={profile}
      config={config}
      requests={myRequests || []}
      defaultPlan={searchParams.plan as 'individual' | 'business' | undefined}
      defaultMonths={searchParams.months ? parseInt(searchParams.months) : undefined}
    />
  );
}
