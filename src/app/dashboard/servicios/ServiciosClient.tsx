'use client';

import { useState } from 'react';
import { Plus, Trash2, DollarSign, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Service } from '@/lib/types';
import PageHeader from '@/components/ui/PageHeader';
import BottomSheet from '@/components/ui/BottomSheet';
import Switch from '@/components/ui/Switch';
import { toast } from '@/components/ui/Toast';

export default function ServiciosClient({ barberId, initial }: { barberId: string; initial: Service[] }) {
  const [items, setItems] = useState<Service[]>(initial);
  const [editing, setEditing] = useState<Service | null>(null);
  const [creating, setCreating] = useState(false);
  const supabase = createClient();

  const upsert = async (data: Partial<Service> & { id?: string }) => {
    if (data.id) {
      const { error } = await supabase.from('services').update({ nombre: data.nombre, precio: data.precio, duracion_min: data.duracion_min, activo: data.activo }).eq('id', data.id);
      if (error) { toast('Error al guardar', 'error'); return; }
      setItems((arr) => arr.map((s) => s.id === data.id ? { ...s, ...data } as Service : s));
      toast('Servicio actualizado', 'success');
    } else {
      const { data: created, error } = await supabase.from('services').insert({ barber_id: barberId, nombre: data.nombre, precio: data.precio, duracion_min: data.duracion_min, activo: data.activo ?? true }).select().single();
      if (error || !created) { toast('Error al crear', 'error'); return; }
      setItems((arr) => [...arr, created]);
      toast('Servicio creado', 'success');
    }
    setEditing(null); setCreating(false);
  };

  const remove = async (id: string) => {
    if (!confirm('¿Eliminar este servicio?')) return;
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) return toast('Error al eliminar', 'error');
    setItems((arr) => arr.filter((s) => s.id !== id));
    toast('Servicio eliminado', 'success');
  };

  const toggle = async (s: Service) => {
    const { error } = await supabase.from('services').update({ activo: !s.activo }).eq('id', s.id);
    if (error) return toast('Error', 'error');
    setItems((arr) => arr.map((x) => x.id === s.id ? { ...x, activo: !s.activo } : x));
  };

  return (
    <>
      <PageHeader title="Servicios" subtitle="Define tu menú de servicios y precios"
        action={<button onClick={() => setCreating(true)} className="btn-primary !h-9 !px-4 !text-[13px]"><Plus className="h-3.5 w-3.5" /> Nuevo</button>}
      />

      {items.length === 0 ? (
        <div className="card-premium flex flex-col items-center py-16 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-base-700">
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-label-tertiary" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M8.5 8.5L20 20M8.5 15.5L20 5" />
            </svg>
          </div>
          <h3 className="text-[15px] font-semibold text-label-primary">Aún no tienes servicios</h3>
          <p className="mt-1 text-[13px] text-label-tertiary">Crea el primero para empezar a recibir reservas.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((s) => (
            <div key={s.id} className={`card-premium-hover flex items-center justify-between gap-3 ${!s.activo ? 'opacity-50' : ''}`}>
              <button onClick={() => setEditing(s)} className="min-w-0 flex-1 text-left">
                <p className="text-[15px] font-semibold text-label-primary">{s.nombre}</p>
                <div className="mt-0.5 flex items-center gap-3 text-[13px] text-label-tertiary">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {s.duracion_min} min</span>
                  <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> <span className="text-brand font-medium">${s.precio}</span></span>
                </div>
              </button>
              <Switch checked={s.activo} onChange={() => toggle(s)} />
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
  const [nombre, setNombre] = useState(initial?.nombre || '');
  const [precio, setPrecio] = useState(initial?.precio?.toString() || '');
  const [duracion, setDuracion] = useState(initial?.duracion_min?.toString() || '30');
  const [activo, setActivo] = useState(initial?.activo ?? true);

  const submit = (e: React.FormEvent) => { e.preventDefault(); onSubmit({ id: initial?.id, nombre: nombre.trim(), precio: parseFloat(precio) || 0, duracion_min: parseInt(duracion) || 30, activo }); };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Nombre del servicio">
        <input type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Corte clásico" className="input" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Precio (USD)">
          <input type="number" min="0" step="0.5" required value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="10" className="input" />
        </Field>
        <Field label="Duración">
          <div className="grid grid-cols-3 gap-2">
            {[30, 45, 60].map((m) => (
              <button key={m} type="button" onClick={() => setDuracion(m.toString())}
                className={`flex h-11 items-center justify-center rounded-lg border text-[14px] font-medium transition-all ${
                  duracion === m.toString() ? 'border-brand bg-brand/10 text-brand' : 'border-glass-border bg-base-700 text-label-tertiary hover:bg-base-600'
                }`}>
                {m} min
              </button>
            ))}
          </div>
        </Field>
      </div>
      <div className="card-premium !p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-medium text-label-primary">Visible para clientes</p>
            <p className="text-[11px] text-label-tertiary">Desactivar lo oculta sin eliminarlo</p>
          </div>
          <Switch checked={activo} onChange={setActivo} />
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
  return <div><label className="block mb-1.5 text-[12px] font-medium text-label-tertiary">{label}</label>{children}</div>;
}
