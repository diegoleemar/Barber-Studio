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
    .from('profiles')
    .select('username')
    .eq('user_id', user.id)
    .maybeSingle();

  if (existing) redirect('/dashboard');

  const meta = user.user_metadata || {};
  const defaultName: string = meta.full_name || meta.name || (user.email || '').split('@')[0];
  const defaultPhoto: string | null = meta.avatar_url || meta.picture || null;

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col lg:flex-row">
        {/* Left: Form */}
        <div className="flex w-full items-center justify-center px-6 py-10 lg:w-1/2">
          <div className="w-full max-w-lg">
            <h1 className="text-[clamp(1.6rem,3vw,2.2rem)] font-extrabold tracking-tight text-[#09090b]">
              Monta tu perfil profesional
            </h1>
            <p className="mt-2 text-[15px] text-[#52525b] leading-relaxed">
              Elige tu profesión y completa los datos para empezar a recibir reservas al pelo.
            </p>
            <div className="mt-8">
              <OnboardingForm defaultName={defaultName} defaultPhoto={defaultPhoto} />
            </div>
          </div>
        </div>

        {/* Right: Illustration Panel */}
        <div className="hidden w-full items-center justify-center bg-[#FAF9F6] p-10 lg:flex lg:w-1/2">
          <div className="max-w-sm text-center">
            <svg viewBox="0 0 280 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto w-64 h-56">
              <rect x="20" y="40" width="240" height="160" rx="16" fill="white" stroke="#e4e4e7" strokeWidth="1.5" />
              <rect x="44" y="64" width="80" height="12" rx="6" fill="#d2ff00" opacity="0.3" />
              <rect x="44" y="84" width="60" height="8" rx="4" fill="#e4e4e7" />
              <rect x="44" y="106" width="192" height="36" rx="8" fill="#d2ff00" opacity="0.15" />
              <rect x="60" y="116" width="120" height="8" rx="4" fill="#d2ff00" opacity="0.4" />
              <rect x="44" y="152" width="192" height="36" rx="8" fill="#f4f4f5" />
              <rect x="60" y="162" width="100" height="8" rx="4" fill="#d4d4d8" />
              <circle cx="74" cy="198" r="6" fill="#10B981" opacity="0.2" />
              <rect x="86" y="194" width="80" height="8" rx="4" fill="#10B981" opacity="0.3" />
            </svg>

            <h3 className="mt-6 text-[20px] font-extrabold text-[#09090b]">
              Tu cuenta casi lista
            </h3>
            <p className="mt-3 text-[14px] text-[#52525b] leading-relaxed">
              Dinos qué haces y crea tu enlace público. En menos de un minuto tendrás tu link activo para recibir citas sin lidiar con chats.
            </p>
            <div className="mt-6 flex flex-col gap-3 text-left">
              {[
                { label: 'Dinos en qué trabajas' },
                { label: 'Completa tus datos' },
                { label: 'Comparte tu link' },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3 text-[13px] text-[#52525b] font-semibold">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#d2ff00] border border-black/10 text-[10px] font-extrabold text-black">{i + 1}</span>
                  {s.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
