import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import OnboardingForm from './OnboardingForm';

export const dynamic = 'force-dynamic';

export default async function OnboardingPage() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: existing } = await supabase
    .from('barbers')
    .select('username')
    .eq('user_id', user.id)
    .maybeSingle();

  if (existing) redirect('/dashboard');

  const meta = user.user_metadata || {};
  const defaultName: string = meta.full_name || meta.name || (user.email || '').split('@')[0];
  const defaultPhoto: string | null = meta.avatar_url || meta.picture || null;

  return (
    <main className="relative flex min-h-screen items-center justify-center px-6 py-10 bg-base-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 left-1/2 h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-brand/10 blur-[140px]" />
      </div>
      <div className="relative z-10 w-full max-w-md">
        <h1 className="text-h1">Tu estudio, listo en segundos</h1>
        <p className="mt-2 text-body">Crea tu perfil para empezar a recibir reservas.</p>

        <div className="mt-8">
          <OnboardingForm defaultName={defaultName} defaultPhoto={defaultPhoto} />
        </div>
      </div>
    </main>
  );
}
