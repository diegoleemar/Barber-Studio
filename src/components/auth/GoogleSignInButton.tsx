'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function GoogleSignInButton({ label = 'Continuar con Google', className }: { label?: string; className?: string }) {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const supabase = createClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${siteUrl}/auth/callback`, queryParams: { access_type: 'offline', prompt: 'consent' } }
    });
    if (error) { console.error(error); setLoading(false); }
  };

  return (
    <button type="button" onClick={handleLogin} disabled={loading}
      className={`inline-flex min-h-[52px] items-center justify-center gap-3 rounded-xl bg-white px-6 text-[15px] font-semibold text-base-950 shadow-sm ring-1 ring-black/5 transition-all duration-150 hover:bg-neutral-50 hover:shadow-md active:scale-[0.98] disabled:opacity-60 ${className || ''}`}>
      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleIcon />}
      <span>{loading ? 'Conectando…' : label}</span>
    </button>
  );
}

const GoogleIcon = () => (
  <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35 26.7 36 24 36c-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C41.5 36 44 30.5 44 24c0-1.2-.1-2.3-.4-3.5z" />
  </svg>
);
