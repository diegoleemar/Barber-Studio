import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const ADMIN_EMAILS = ['diegoleemar@gmail.com'];

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/dashboard';

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (user) {
        const { data: barber } = await supabase
          .from('barbers')
          .select('id, subscription_status')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!barber) {
          return NextResponse.redirect(`${origin}/onboarding`);
        }

        // Auto-activar cuenta demo
        const email = (user.email || user.user_metadata?.email || '').toLowerCase();
        if (ADMIN_EMAILS.includes(email) && barber.subscription_status !== 'active') {
          await supabase
            .from('barbers')
            .update({ subscription_status: 'active', subscription_plan: 'barberia' })
            .eq('id', barber.id);
        }

        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
