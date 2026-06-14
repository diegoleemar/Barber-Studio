'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Save, Link as LinkIcon, Copy, Check, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Profile, Profession } from '@/lib/types';
import PageHeader from '@/components/ui/PageHeader';
import { toast } from '@/components/ui/Toast';
import { slugify } from '@/lib/time';

export default function PerfilForm({ profile }: { profile: Profile & { profession?: Profession } }) {
  const router = useRouter();
  const [businessName, setBusinessName] = useState(profile.business_name);
  const [username, setUsername] = useState(profile.username);
  const [description, setDescription] = useState(profile.description || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [address, setAddress] = useState(profile.address || '');
  const [fotoUrl, setFotoUrl] = useState(profile.photo_url || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    setLinkUrl(`${window.location.origin}/${profile.username}`);
  }, [profile.username]);

  useEffect(() => {
    if (!username || username === profile.username) { setUsernameAvailable(null); return; }
    let cancelled = false;
    const t = setTimeout(async () => {
      const supabase = createClient();
      const { data } = await supabase.from('profiles').select('id').eq('username', username).maybeSingle();
      if (!cancelled) setUsernameAvailable(!data);
    }, 400);
    return () => { cancelled = true; clearTimeout(t); };
  }, [username, profile.username]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(linkUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* fallback */ }
  };

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split('.').pop();
    const path = `${profile.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true, cacheControl: '3600' });
    if (error) { toast('Error al subir la foto', 'error'); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
    setFotoUrl(publicUrl);
    setUploading(false);
  };

  const save = async () => {
    if (username !== profile.username && usernameAvailable !== true) {
      toast('Ese nombre de usuario ya está tomado', 'error'); return;
    }
    setSaving(true);
    const supabase = createClient();
    const updates: Record<string, unknown> = {
      business_name: businessName,
      description: description,
      photo_url: fotoUrl || null,
      phone: phone || null,
      address: address || null,
      updated_at: new Date().toISOString()
    };
    if (username !== profile.username && usernameAvailable === true) {
      updates.username = username;
    }
    const { error } = await supabase.from('profiles').update(updates).eq('id', profile.id);
    setSaving(false);
    if (error) { toast('Error al guardar el perfil', 'error'); return; }
    setLinkUrl(`${window.location.origin}/${username}`);
    toast('¡Perfil listo y guardado!', 'success');
    router.refresh();
  };

  return (
    <>
      <PageHeader title="Perfil" subtitle="Configura cómo te ven tus clientes" />

      {profile.profession && (
        <div className="mb-4 bg-[#FAF9F6] border border-neutral-200/80 rounded-xl px-4 py-3 flex items-center gap-3 text-left">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Trabajo:</span>
          <span className="text-[14px] font-bold text-neutral-900">{profile.profession.name}</span>
          <span className="text-[11px] text-neutral-400 font-bold ml-auto">{profile.profession.industry?.name || ''}</span>
        </div>
      )}

      <div className="card-premium !p-6 text-left bg-white border border-neutral-200/80 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            {fotoUrl ? (
              <img src={fotoUrl} alt={businessName} className="h-20 w-20 rounded-2xl object-cover ring-1 ring-[#d2ff00]/40" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-neutral-100 border border-neutral-200 text-2xl font-bold text-neutral-500">
                {businessName.charAt(0).toUpperCase()}
              </div>
            )}
            <label className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-[#d2ff00] text-black border border-black/5 shadow-sm hover:brightness-105 transition-all">
              {uploading ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black/30 border-t-black" />
              ) : <Camera className="h-4 w-4" />}
              <input type="file" accept="image/*" hidden onChange={onUpload} />
            </label>
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-bold text-neutral-900">Foto de perfil</p>
            <p className="text-[12px] text-neutral-400 font-medium">Recomendado: cuadrada, mínimo 400×400</p>
          </div>
        </div>
      </div>

      <div className="mt-4 card-premium space-y-5 !p-6 text-left bg-white border border-neutral-200/80 shadow-sm">
        <Field label="Nombre de tu negocio (o el tuyo)">
          <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="input" />
        </Field>
        <Field label="Descripción corta">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="Escribe una breve descripción sobre ti y tu trabajo..." rows={4} className="textarea" />
        </Field>
        <Field label="Teléfono de contacto">
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
            placeholder="0412-1234567" className="input" />
        </Field>
        <Field label="Dirección / Ubicación">
          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
            placeholder="¿Dónde queda tu negocio?" className="input" />
        </Field>
      </div>

      {profile.profession?.booking_flow_type === 'interval' && (
        <div className="mt-4 card-premium !p-5 text-left bg-white border border-neutral-200/80 shadow-sm">
          <Field label="Tu enlace propio">
            <div className="flex items-center gap-2 mb-2">
              <LinkIcon className="h-4 w-4 text-neutral-600 shrink-0" />
              <p className="text-[12px] font-bold text-neutral-500">Comparte este enlace para que te reserven de una</p>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-[#FAF9F6] px-3.5 py-2.5">
              <span className="text-[13px] text-neutral-400 font-bold shrink-0 hidden sm:block">qfino.app/</span>
              <input type="text" value={username} onChange={(e) => setUsername(slugify(e.target.value))}
                className="flex-1 bg-transparent text-[14px] text-neutral-900 font-semibold outline-none" />
              {usernameAvailable === true && username !== profile.username && <Check className="h-4 w-4 text-emerald-500 shrink-0 font-bold" />}
              {usernameAvailable === false && <span className="text-[11px] text-red-500 font-bold shrink-0">Ya existe</span>}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button onClick={copyLink}
                className="touch-target flex items-center gap-1.5 rounded-lg bg-[#d2ff00]/20 border border-[#d2ff00]/40 px-3 py-2 text-[12px] font-bold text-neutral-900 hover:bg-[#d2ff00]/40 transition">
                {copied ? <><Check className="h-3.5 w-3.5" /> ¡Copiado al pelo!</> : <><Copy className="h-3.5 w-3.5" /> Copiar mi enlace</>}
              </button>
              <a href={linkUrl} target="_blank" rel="noreferrer"
                className="touch-target flex items-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-2 text-[12px] font-bold text-neutral-500 hover:text-black hover:bg-neutral-50 transition">
                <ExternalLink className="h-3.5 w-3.5" /> Abrir
              </a>
            </div>
          </Field>
        </div>
      )}

      <div className="mt-6">
        <button onClick={save} disabled={saving} className="btn-primary w-full shadow-sm">
          <Save className="h-4 w-4" /> {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block mb-1.5 text-[12px] font-bold text-neutral-500 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}
