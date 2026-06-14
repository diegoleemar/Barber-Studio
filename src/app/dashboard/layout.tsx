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

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, profession:professions(*)')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!profile) redirect('/onboarding');

  const status = profile.subscription_status || 'inactive';

  if (status !== 'active') {
    const userEmail = getEmail(user);
    const isDemo = userEmail && ADMIN_EMAILS.includes(userEmail);

    if (isDemo) {
      await supabase
        .from('profiles')
        .update({ subscription_status: 'active', subscription_plan: 'business' })
        .eq('id', profile.id);
      const { data: updated } = await supabase
        .from('profiles')
        .select('*, profession:professions(*)')
        .eq('id', profile.id)
        .single();
      if (updated) Object.assign(profile, updated);
    }
    // New users can explore the dashboard freely before subscribing
  }

  return <DashboardShell profile={profile}>{children}</DashboardShell>;
}
