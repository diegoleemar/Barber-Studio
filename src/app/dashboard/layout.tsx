import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/dashboard/DashboardShell';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: barber } = await supabase
    .from('barbers')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!barber) redirect('/onboarding');

  if (barber.subscription_status !== 'active') redirect('/pagar');

  return <DashboardShell barber={barber}>{children}</DashboardShell>;
}
