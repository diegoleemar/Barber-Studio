'use client';

import { useState } from 'react';
import { Plus, Trash2, DollarSign, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Service } from '@/lib/types';
import PageHeader from '@/components/ui/PageHeader';
import BottomSheet from '@/components/ui/BottomSheet';
import Switch from '@/components/ui/Switch';
import { toast } from '@/components/ui/Toast';

export default function ServiciosClient({ profileId, initial }: { profileId: string; initial: Service[] }) {
  const [items, setItems] = useState<Service[]>(initial);
  const [editing, setEditing] = useState<Service | null>(null);
  const [creating, setCreating] = useState(false);
  const supabase = createClient();

  const upsert = async (data: Partial<Service> & { id?: string }) => {
    if (data.id) {
      const { error } = await supabase.from('services').update({ name: data.name, price: data.price, duration_min: data.duration_min, is_active: data.is_active }).eq('id', data.id);
      if (error) { toast('Error al guardar el servicio', 'error'); return; }
      setItems((arr) => arr.map((s) => s.id === data.id ? { ...s, ...data } as Service : s));
      toast('Servicio guardado al pelo', 'success');
    } else {
      const { data: created, error } = await supabase.from('services').insert({ profile_id: profileId, name: data.name, price: data.price, duration_min: data.duration_min, is_active: data.is_active ?? true }).select().single();
      if (error || !created) { toast('Error al crear el servicio', 'error'); return; }
      setItems((arr) => [...arr, created]);
      toast('Servicio montado con éxito', 'success');
    }
    setEditing(null); setCreating(false);
  };

  const remove = async (id: string) => {
    if (!confirm('¿Seguro que quieres borrar este servicio?')) return;
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) return toast('Error al eliminar', 'error');
    setItems((arr) => arr.filter((s) => s.id !== id));
    toast('Servicio borrado', 'success');
  };

  const toggle = async (s: Service) => {
    const { error } = await supabase.from('services').update({ is_active: !s.is_active }).eq('id', s.id);
    if (error) return toast('Error', 'error');
    setItems((arr) => arr.map((x) => x.id === s.id ? { ...x, is_active: !s.is_active } : x));
  };

  return (
    <>
      <PageHeader title="Servicios" subtitle="Define qué ofreces y cuánto cobras"
        action={<button onClick={() => setCreating(true)} className="btn-primary !h-9 !px-4 !text-[13px]"><Plus className="h-3.5 w-3.5" /> Nuevo servicio</button>}
      />

      {items.length === 0 ? (
        <div className="card-premium flex flex-col items-center py-16 text-center bg-white border border-neutral-200 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FAF9F6] border border-neutral-200">
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M8.5 8.5L20 20M8.5 15.5L20 5" />
            </svg>
          </div>
          <h3 className="text-[15px] font-bold text-neutral-900">No tienes servicios configurados</h3>
          <p className="mt-1 text-[13px] text-neutral-500 font-medium">Crea tu primer servicio para empezar a recibir citas.</p>
        </div>
      ) : (
        <div className="space-y-2 text-left">
          {items.map((s) => (
            <div key={s.id} className={`card-premium-hover bg-white border border-neutral-200 p-4 rounded-xl shadow-sm flex items-center justify-between gap-3 ${!s.is_active ? 'opacity-50' : ''}`}>
              <button onClick={() => setEditing(s)} className="min-w-0 flex-1 text-left">
                <p className="text-[15px] font-bold text-neutral-900">{s.name}</p>
                <div className="mt-1 flex items-center gap-3 text-[13px] text-neutral-500 font-semibold">
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {s.duration_min} min</span>
                  <span className="flex items-center gap-0.5"><DollarSign className="h-3.5 w-3.5" /> <span className="text-black bg-[#d2ff00]/30 px-1 rounded font-bold">${s.price}</span></span>
                </div>
              </button>
              <Switch checked={s.is_active} onChange={() => toggle(s)} />
            </div>
          ))}
        </div>
      )}

      <BottomSheet open={creating || !!editing} onClose={() => { setCreating(false); setEditing(null); }} title={editing ? 'Editar servicio' : 'Nuevo servicio'}>
        <ServiceForm initial={editing} onSubmit={upsert} onDelete={editing ? () => remove(editing.id) : undefined} />
      </BottomSheet>
    </>
  );
}

function ServiceForm({ initial, onSubmit, onDelete }: { initial: Service | null; onSubmit: (data: Partial<Service> & { id?: string }) => void; onDelete?: () => void }) {
  const [name, setName] = useState(initial?.name || '');
  const [price, setPrice] = useState(initial?.price?.toString() || '');
  const [duration, setDuration] = useState(initial?.duration_min?.toString() || '30');
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);

  const submit = (e: React.FormEvent) => { e.preventDefault(); onSubmit({ id: initial?.id, name: name.trim(), price: parseFloat(price) || 0, duration_min: parseInt(duration) || 30, is_active: isActive }); };

  return (
    <form onSubmit={submit} className="space-y-4 text-left">
      <Field label="Nombre del servicio">
        <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Corte clásico" className="input" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Precio (USD)">
          <input type="number" min="0" step="0.5" required value={price} onChange={(e) => setPrice(e.target.value)} placeholder="10" className="input" />
        </Field>
        <Field label="Duración">
          <div className="grid grid-cols-3 gap-2">
            {[30, 45, 60].map((m) => (
              <button key={m} type="button" onClick={() => setDuration(m.toString())}
                className={`flex h-11 items-center justify-center rounded-lg border text-[14px] font-bold transition-all ${
                  duration === m.toString() ? 'border-black bg-[#d2ff00]/25 text-black' : 'border-neutral-200 bg-neutral-50 text-neutral-500 hover:bg-neutral-100'
                }`}>
                {m} min
              </button>
            ))}
          </div>
        </Field>
      </div>
      <div className="card-premium !p-4 bg-white border border-neutral-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-bold text-neutral-900">Mostrar en mi web</p>
            <p className="text-[11px] text-neutral-400 font-medium">Si lo apagas, tus clientes no lo verán pero no se borra.</p>
          </div>
          <Switch checked={isActive} onChange={setIsActive} />
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        {onDelete && <button type="button" onClick={onDelete} className="btn-danger flex-1"><Trash2 className="h-4 w-4" /> Eliminar</button>}
        <button type="submit" className="btn-primary flex-1">{initial ? 'Guardar' : 'Crear'}</button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block mb-1.5 text-[12px] font-bold text-neutral-500 uppercase tracking-wider">{label}</label>{children}</div>;
}
