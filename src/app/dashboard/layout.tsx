import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/dashboard/DashboardShell';

export const dynamic = 'force-dynamic';

const ADMIN_EMAIL = 'diegoleemar@gmail.com';

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

  // Auto-activar cuenta demo
  if (user.email === ADMIN_EMAIL && barber.subscription_status !== 'active') {
    await supabase
      .from('barbers')
      .update({ subscription_status: 'active', subscription_plan: 'barberia' })
      .eq('id', barber.id);
    const { data: updated } = await supabase
      .from('barbers')
      .select('*')
      .eq('id', barber.id)
      .single();
    if (updated) Object.assign(barber, updated);
  }

  if (barber.subscription_status !== 'active') redirect('/pagar');

  return <DashboardShell barber={barber}>{children}</DashboardShell>;
}
