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
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('user_id', user.id)
      .maybeSingle();
    if (profile) redirect('/dashboard');
    redirect('/onboarding');
  }

  return <LandingClient />;
}
