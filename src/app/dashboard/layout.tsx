import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/dashboard/DashboardShell';

export const dynamic = 'force-dynamic';

const ADMIN_EMAILS = ['diegoleemar@gmail.com'];

function getEmail(user: { email?: string | null; user_metadata?: { email?: string } }): string | null {
  return (user.email || user.user_metadata?.email || '').toLowerCase() || null;
}

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

  const status = barber.subscription_status || 'inactive';

  if (status !== 'active') {
    const userEmail = getEmail(user);
    const isDemo = userEmail && ADMIN_EMAILS.includes(userEmail);

    if (isDemo) {
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
    } else {
      redirect('/pagar');
    }
  }

  return <DashboardShell barber={barber}>{children}</DashboardShell>;
}
