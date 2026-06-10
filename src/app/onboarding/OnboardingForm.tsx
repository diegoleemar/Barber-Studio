'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Check, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { slugify } from '@/lib/time';

export default function OnboardingForm({ defaultName, defaultPhoto }: { defaultName: string; defaultPhoto: string | null }) {
  const router = useRouter();
  const [nombre, setNombre] = useState(defaultName);
  const [username, setUsername] = useState(slugify(defaultName));
  const [available, setAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username || username.length < 3) { setAvailable(null); return; }
    let cancelled = false;
    const t = setTimeout(async () => {
      const supabase = createClient();
      const { data } = await supabase.from('barbers').select('id').eq('username', username).maybeSingle();
      if (!cancelled) setAvailable(!data);
    }, 300);
    return () => { cancelled = true; clearTimeout(t); };
  }, [username]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username || username.length < 3) { setError('Elige un usuario de al menos 3 caracteres'); return; }
    if (available === false) { setError('Ese usuario ya está en uso'); return; }
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError('Sesión inválida'); setLoading(false); return; }
    const { error } = await supabase.from('barbers').insert({ user_id: user.id, username, nombre, foto_url: defaultPhoto, descripcion: '', intervalo_minutos: 30 });
    if (error) { setError(error.message); setLoading(false); return; }
    router.replace('/dashboard');
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="card-premium !p-5">
        <div className="flex items-center gap-4">
          {defaultPhoto ? (
            <img src={defaultPhoto} alt={nombre} className="h-14 w-14 shrink-0 rounded-full object-cover ring-1 ring-glass-border" />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-base-700 text-xl font-semibold text-label-secondary">
              {nombre.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <label className="text-[12px] font-medium text-label-tertiary mb-1.5 block">Nombre del estudio</label>
            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre o estudio" className="input" required />
          </div>
        </div>
      </div>

      <div className="card-premium !p-5">
        <label className="text-[12px] font-medium text-label-tertiary mb-1.5 block">Tu enlace público</label>
        <div className="flex items-center gap-2 rounded-lg bg-base-700 px-3.5 py-2.5 ring-1 ring-glass-border focus-within:ring-brand/40 transition-all">
          <span className="text-[13px] text-label-quaternary shrink-0">barberstudio.app/</span>
          <input type="text" value={username} onChange={(e) => setUsername(slugify(e.target.value))} placeholder="tunombre" className="flex-1 bg-transparent text-[14px] text-label-primary outline-none" required />
          {available === true && username.length >= 3 && <Check className="h-4 w-4 text-emerald-400 shrink-0" />}
          {available === false && <X className="h-4 w-4 text-red-400 shrink-0" />}
        </div>
        <p className="mt-2 text-[12px] text-label-tertiary">Comparte este enlace para que tus clientes reserven contigo.</p>
      </div>

      {error && <p className="text-center text-[13px] text-red-400">{error}</p>}

      <button type="submit" disabled={loading || available === false} className="btn-primary w-full">
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creando…</> : 'Crear mi estudio'}
      </button>
    </form>
  );
}
