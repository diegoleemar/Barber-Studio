'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Save, Link as LinkIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Barber } from '@/lib/types';
import PageHeader from '@/components/ui/PageHeader';
import { toast } from '@/components/ui/Toast';

export default function PerfilForm({ barber }: { barber: Barber }) {
  const router = useRouter();
  const [nombre, setNombre] = useState(barber.nombre);
  const [descripcion, setDescripcion] = useState(barber.descripcion || '');
  const [intervalo, setIntervalo] = useState<30 | 45 | 60>(barber.intervalo_minutos);
  const [fotoUrl, setFotoUrl] = useState(barber.foto_url || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split('.').pop();
    const path = `${barber.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true, cacheControl: '3600' });
    if (error) { toast('Error al subir', 'error'); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
    setFotoUrl(publicUrl);
    setUploading(false);
  };

  const save = async () => {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from('barbers').update({
      nombre, descripcion, intervalo_minutos: intervalo, foto_url: fotoUrl || null,
      updated_at: new Date().toISOString()
    }).eq('id', barber.id);
    setSaving(false);
    if (error) { toast('Error al guardar', 'error'); return; }
    toast('Perfil actualizado', 'success');
    router.refresh();
  };

  return (
    <>
      <PageHeader title="Perfil" subtitle="Configura cómo te ven tus clientes" />

      <div className="card-premium !p-6">
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            {fotoUrl ? (
              <img src={fotoUrl} alt={nombre} className="h-20 w-20 rounded-2xl object-cover ring-1 ring-glass-border" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-base-700 text-2xl font-semibold text-label-secondary">
                {nombre.charAt(0).toUpperCase()}
              </div>
            )}
            <label className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-brand text-white shadow-sm hover:brightness-110 transition-all">
              {uploading ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : <Camera className="h-4 w-4" />}
              <input type="file" accept="image/*" hidden onChange={onUpload} />
            </label>
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-medium text-label-primary">Foto del estudio</p>
            <p className="text-[12px] text-label-tertiary">Recomendado: cuadrada, mínimo 400×400</p>
          </div>
        </div>
      </div>

      <div className="mt-4 card-premium space-y-5 !p-6">
        <Field label="Nombre del estudio">
          <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className="input" />
        </Field>
        <Field label="Descripción">
          <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Cuéntale a tus clientes sobre tu estudio…" rows={4} className="textarea" />
        </Field>
      </div>

      <div className="mt-4 card-premium !p-6">
        <Field label="Intervalo entre citas">
          <div className="grid grid-cols-2 gap-2">
            {[30, 45, 60].map((m) => (
              <button key={m} type="button" onClick={() => setIntervalo(m as 30 | 45 | 60)}
                className={`flex h-12 items-center justify-center rounded-lg border text-[14px] font-medium transition-all duration-150 ${
                  intervalo === m ? 'border-brand bg-brand/10 text-brand' : 'border-glass-border bg-base-700 text-label-tertiary hover:bg-base-600 hover:text-label-secondary'
                }`}>
                {m} min
              </button>
            ))}
          </div>
        </Field>
      </div>

      <div className="mt-4 card-premium !p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <LinkIcon className="h-4 w-4 text-label-quaternary shrink-0" />
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-label-tertiary">Tu enlace público</p>
              <p className="text-[14px] font-medium text-brand truncate">/{barber.username}</p>
            </div>
          </div>
          <span className="text-[11px] text-label-quaternary shrink-0">No editable</span>
        </div>
      </div>

      <div className="mt-6">
        <button onClick={save} disabled={saving} className="btn-primary w-full">
          <Save className="h-4 w-4" /> {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block mb-1.5 text-[12px] font-medium text-label-tertiary">{label}</label>
      {children}
    </div>
  );
}
