import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import LandingClient from './LandingClient';

export default async function Home() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    const { data: barber } = await supabase
      .from('barbers')
      .select('username')
      .eq('user_id', user.id)
      .maybeSingle();
    if (barber) redirect('/dashboard');
    redirect('/onboarding');
  }

  return <LandingClient />;
}
