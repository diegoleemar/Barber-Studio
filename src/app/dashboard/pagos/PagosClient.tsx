'use client';

import { useState } from 'react';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { PaymentMethod, PaymentType } from '@/lib/types';
import PageHeader from '@/components/ui/PageHeader';
import BottomSheet from '@/components/ui/BottomSheet';
import Switch from '@/components/ui/Switch';
import { toast } from '@/components/ui/Toast';
import { PaymentIcon } from '@/components/icons/PaymentIcons';

const TIPOS: { value: PaymentType; label: string }[] = [
  { value: 'pago_movil', label: 'Pago Móvil' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'efectivo', label: 'Efectivo / Divisas' }
];

const BANCOS_VE = ['Banesco', 'Banco de Venezuela', 'Mercantil', 'Provincial (BBVA)', 'Banco Nacional de Crédito (BNC)', 'Bancaribe', 'Banco del Tesoro', 'Banco Plaza', 'Banco Exterior', 'Banco Sofitasa', 'Banco Activo', 'Bicentenario', '100% Banco', 'Otro'];

export default function PagosClient({ barberId, initial }: { barberId: string; initial: PaymentMethod[] }) {
  const [items, setItems] = useState<PaymentMethod[]>(initial);
  const [editing, setEditing] = useState<PaymentMethod | null>(null);
  const [creatingType, setCreatingType] = useState<PaymentType | null>(null);
  const supabase = createClient();

  const upsert = async (data: { id?: string; tipo: PaymentType; datos: Record<string, string>; activo: boolean }) => {
    if (data.id) {
      const { error } = await supabase.from('payment_methods').update({ datos: data.datos, activo: data.activo }).eq('id', data.id);
      if (error) return toast('Error', 'error');
      setItems((arr) => arr.map((x) => x.id === data.id ? { ...x, ...data } : x));
      toast('Método actualizado', 'success');
    } else {
      const { data: created, error } = await supabase.from('payment_methods').insert({ barber_id: barberId, tipo: data.tipo, datos: data.datos, activo: data.activo }).select().single();
      if (error || !created) return toast('Error', 'error');
      setItems((arr) => [...arr, created]);
      toast('Método añadido', 'success');
    }
    setEditing(null); setCreatingType(null);
  };

  const remove = async (id: string) => {
    if (!confirm('¿Eliminar este método?')) return;
    const { error } = await supabase.from('payment_methods').delete().eq('id', id);
    if (error) return toast('Error', 'error');
    setItems((arr) => arr.filter((x) => x.id !== id));
  };

  const toggle = async (p: PaymentMethod) => {
    const { error } = await supabase.from('payment_methods').update({ activo: !p.activo }).eq('id', p.id);
    if (error) return toast('Error', 'error');
    setItems((arr) => arr.map((x) => x.id === p.id ? { ...x, activo: !p.activo } : x));
  };

  return (
    <>
      <PageHeader title="Pagos" subtitle="Información que ven tus clientes al reservar" />

      {items.length > 0 && (
        <div className="mb-5 space-y-2">
          {items.map((p) => {
            const t = TIPOS.find((x) => x.value === p.tipo);
            return (
              <div key={p.id} className={`card-premium-hover flex items-center justify-between gap-3 !p-4 ${!p.activo ? 'opacity-50' : ''}`}>
                <button onClick={() => setEditing(p)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10">
                    <PaymentIcon tipo={p.tipo} className="h-5 w-5 text-brand" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-label-primary">{t?.label || p.tipo}</p>
                    <p className="truncate text-[12px] text-label-tertiary">{summary(p)}</p>
                  </div>
                </button>
                <div className="flex items-center gap-2">
                  {p.activo ? <Eye className="h-3.5 w-3.5 text-label-quaternary" /> : <EyeOff className="h-3.5 w-3.5 text-label-quaternary" />}
                  <Switch checked={p.activo} onChange={() => toggle(p)} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mb-3">
        <p className="text-[13px] font-medium text-label-tertiary mb-3">Añadir método de pago</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {TIPOS.map((t) => (
            <button key={t.value} onClick={() => setCreatingType(t.value)} className="card-premium-hover flex items-center gap-3 !p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10">
                <PaymentIcon tipo={t.value} className="h-5 w-5 text-brand" />
              </span>
              <div className="text-left">
                <p className="text-[14px] font-semibold text-label-primary">{t.label}</p>
                <p className="text-[11px] text-label-tertiary">
                  {t.value === 'pago_movil' ? 'Banco + teléfono' : t.value === 'transferencia' ? 'Cuenta bancaria' : 'Efectivo en USD/BS'}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {items.length === 0 && <div className="card-premium py-10 text-center"><p className="text-[13px] text-label-tertiary">Aún no tienes métodos de pago configurados</p></div>}

      <BottomSheet open={!!editing || !!creatingType} onClose={() => { setEditing(null); setCreatingType(null); }}
        title={editing ? `Editar · ${(TIPOS.find((x) => x.value === editing.tipo)?.label) || editing.tipo}` : creatingType ? `Nuevo · ${(TIPOS.find((x) => x.value === creatingType)?.label) || creatingType}` : ''}>
        {(editing || creatingType) && <PaymentForm initial={editing} tipo={editing?.tipo || creatingType!} onSubmit={upsert} onDelete={editing ? () => remove(editing.id) : undefined} />}
      </BottomSheet>
    </>
  );
}

const summary = (p: PaymentMethod) => {
  if (p.tipo === 'pago_movil') return `${p.datos.banco || ''} · ${p.datos.telefono || ''}`;
  if (p.tipo === 'transferencia') return `${p.datos.banco || ''} · ${(p.datos.cuenta || '').slice(-6)}`;
  return p.datos.descripcion || 'Efectivo';
};

function PaymentForm({ initial, tipo, onSubmit, onDelete }: { initial: PaymentMethod | null; tipo: PaymentType; onSubmit: (data: { id?: string; tipo: PaymentType; datos: Record<string, string>; activo: boolean }) => void; onDelete?: () => void }) {
  const [datos, setDatos] = useState<Record<string, string>>(initial?.datos || {});
  const [activo, setActivo] = useState(initial?.activo ?? true);
  const set = (k: string, v: string) => setDatos((d) => ({ ...d, [k]: v }));
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ id: initial?.id, tipo, datos, activo }); }} className="space-y-4">
      {tipo === 'pago_movil' && (
        <>
          <Field label="Banco"><select required value={datos.banco || ''} onChange={(e) => set('banco', e.target.value)} className="select"><option value="" disabled>Selecciona…</option>{BANCOS_VE.map((b) => <option key={b} value={b}>{b}</option>)}</select></Field>
          <Field label="Teléfono"><input type="tel" required value={datos.telefono || ''} onChange={(e) => set('telefono', e.target.value)} placeholder="0412-1234567" className="input" /></Field>
          <Field label="Cédula"><input type="text" required value={datos.cedula || ''} onChange={(e) => set('cedula', e.target.value)} placeholder="V-12345678" className="input" /></Field>
        </>
      )}
      {tipo === 'transferencia' && (
        <>
          <Field label="Banco"><select required value={datos.banco || ''} onChange={(e) => set('banco', e.target.value)} className="select"><option value="" disabled>Selecciona…</option>{BANCOS_VE.map((b) => <option key={b} value={b}>{b}</option>)}</select></Field>
          <Field label="Número de cuenta"><input type="text" required value={datos.cuenta || ''} onChange={(e) => set('cuenta', e.target.value)} placeholder="0102-0000-00-0000000000" className="input" /></Field>
          <Field label="Titular"><input type="text" required value={datos.titular || ''} onChange={(e) => set('titular', e.target.value)} placeholder="Nombre del titular" className="input" /></Field>
          <Field label="Cédula / RIF"><input type="text" required value={datos.cedula || ''} onChange={(e) => set('cedula', e.target.value)} placeholder="V-12345678" className="input" /></Field>
        </>
      )}
      {tipo === 'efectivo' && (
        <Field label="Descripción"><input type="text" required value={datos.descripcion || ''} onChange={(e) => set('descripcion', e.target.value)} placeholder="Efectivo en USD al llegar al estudio" className="input" /></Field>
      )}
      <div className="card-premium !p-4">
        <div className="flex items-center justify-between">
          <div><p className="text-[13px] font-medium text-label-primary">Activo</p><p className="text-[11px] text-label-tertiary">Mostrar a tus clientes</p></div>
          <Switch checked={activo} onChange={setActivo} />
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        {onDelete && <button type="button" onClick={onDelete} className="btn-danger flex-1"><Trash2 className="h-4 w-4" /> Eliminar</button>}
        <button type="submit" className="btn-primary flex-1">{initial ? 'Guardar' : 'Añadir'}</button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block mb-1.5 text-[12px] font-medium text-label-tertiary">{label}</label>{children}</div>;
}
