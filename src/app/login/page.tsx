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
    <main className="relative flex min-h-screen flex-col items-center justify-center px-6 bg-base-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-brand/10 blur-[160px]" />
      </div>

      <Link href="/" className="absolute left-5 top-5 btn-ghost !h-9"><ArrowLeft className="h-4 w-4" /> Volver</Link>

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand shadow-glow">
            <img src="/logo.png" alt="" className="h-8 w-8 object-contain" />
          </div>
          <h1 className="text-h1">Bienvenido</h1>
          <p className="mt-2 text-body">Inicia sesión para gestionar tu barbería</p>
        </div>

        <div className="space-y-4">
          <GoogleSignInButton className="w-full" />
          {searchParams.error && <p className="text-center text-[13px] text-red-400">No se pudo iniciar sesión. Intenta de nuevo.</p>}
        </div>

        <p className="mt-10 text-center text-[12px] text-label-tertiary">Al continuar aceptas los términos del servicio</p>
      </div>
    </main>
  );
}
