import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';

export default async function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect('/dashboard');

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-6 bg-[#FAF9F6]">
      {/* Decorative radial lighting in light yellow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-[#d2ff00]/15 blur-[120px]" />
      </div>

      <Link href="/" className="absolute left-5 top-5 btn-secondary !h-9 text-[13px]">
        <ArrowLeft className="h-4 w-4" /> Volver al inicio
      </Link>

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#d2ff00] border border-black/10 shadow-sm">
            <span className="text-black text-[22px] font-extrabold">Q</span>
          </div>
          <h1 className="text-h1">Entrar a Qfino</h1>
          <p className="mt-2 text-body">Entra con Google para cuadrar tu agenda al pelo en un minuto</p>
        </div>

        <div className="space-y-4">
          <GoogleSignInButton label="Conectar con Google" className="w-full !rounded-full !bg-black !text-white !border-transparent hover:!brightness-110 shadow-sm" />
          {searchParams.error && <p className="text-center text-[13px] text-red-600 font-medium">Hubo un error al iniciar sesión. Por favor, intenta de nuevo.</p>}
        </div>

        <p className="mt-10 text-center text-[12px] text-label-tertiary font-medium">Al continuar, aceptas nuestros términos de servicio.</p>
      </div>
    </main>
  );
}
