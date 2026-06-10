import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import PagarClient from './PagarClient';

export const dynamic = 'force-dynamic';

export default async function PagarPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: barber } = await supabase
    .from('barbers')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!barber) redirect('/onboarding');
  if (barber.subscription_status === 'active') redirect('/dashboard');

  const { data: config } = await supabase
    .from('platform_config')
    .select('*')
    .single();

  const { data: myRequests } = await supabase
    .from('payment_requests')
    .select('*')
    .eq('barber_id', barber.id)
    .order('created_at', { ascending: false });

  return (
    <PagarClient
      barber={barber}
      config={config}
      requests={myRequests || []}
    />
  );
}
