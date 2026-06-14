'use client';

import { useState } from 'react';
import { Plus, Trash2, CalendarX, Clock, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { BlockedSlot, Schedule } from '@/lib/types';
import { DIAS_SEMANA, formatHora12 } from '@/lib/time';
import PageHeader from '@/components/ui/PageHeader';
import BottomSheet from '@/components/ui/BottomSheet';
import Switch from '@/components/ui/Switch';
import { toast } from '@/components/ui/Toast';

const DEFAULT_START = '09:00';
const DEFAULT_END = '18:00';

export default function HorariosClient({ profileId, initialSchedules, initialBlocked }: { profileId: string; initialSchedules: Schedule[]; initialBlocked: BlockedSlot[] }) {
  const [schedules, setSchedules] = useState<Schedule[]>(initialSchedules);
  const [blocked, setBlocked] = useState<BlockedSlot[]>(initialBlocked);
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [creatingBlock, setCreatingBlock] = useState(false);
  const supabase = createClient();

  const rangesByDay = (d: number) => schedules.filter((s) => s.dia_semana === d).sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
  const dayIsOpen = (d: number) => rangesByDay(d).some((s) => s.is_active);

  const toggleDay = async (d: number) => {
    const existing = rangesByDay(d);
    if (existing.length === 0) {
      const { data, error } = await supabase.from('schedules').insert({ profile_id: profileId, dia_semana: d, hora_inicio: DEFAULT_START, hora_fin: DEFAULT_END, is_active: true }).select().single();
      if (error || !data) return toast('Error', 'error');
      setSchedules((arr) => [...arr, data]);
    } else {
      const next = !dayIsOpen(d);
      const ids = existing.map((s) => s.id);
      const { error } = await supabase.from('schedules').update({ is_active: next }).in('id', ids);
      if (error) return toast('Error', 'error');
      setSchedules((arr) => arr.map((x) => ids.includes(x.id) ? { ...x, is_active: next } : x));
    }
  };

  const addRange = async (d: number, hora_inicio: string, hora_fin: string) => {
    const { data, error } = await supabase.from('schedules').insert({ profile_id: profileId, dia_semana: d, hora_inicio, hora_fin, is_active: true }).select().single();
    if (error || !data) return toast('Error', 'error');
    setSchedules((arr) => [...arr, data]);
  };

  const updateRange = async (id: string, hora_inicio: string, hora_fin: string) => {
    const { error } = await supabase.from('schedules').update({ hora_inicio, hora_fin }).eq('id', id);
    if (error) return toast('Error', 'error');
    setSchedules((arr) => arr.map((s) => s.id === id ? { ...s, hora_inicio, hora_fin } : s));
  };

  const removeRange = async (id: string) => {
    const { error } = await supabase.from('schedules').delete().eq('id', id);
    if (error) return toast('Error', 'error');
    setSchedules((arr) => arr.filter((s) => s.id !== id));
  };

  const applyPreset = async (d: number, preset: 'corrido' | 'descanso') => {
    const existing = rangesByDay(d);
    const ids = existing.map((s) => s.id);
    if (ids.length > 0) await supabase.from('schedules').delete().in('id', ids);
    const ranges = preset === 'corrido' ? [{ ini: '09:00', fin: '18:00' }] : [{ ini: '09:00', fin: '13:00' }, { ini: '15:00', fin: '19:00' }];
    const { data, error } = await supabase.from('schedules').insert(ranges.map((r) => ({ profile_id: profileId, dia_semana: d, hora_inicio: r.ini, hora_fin: r.fin, is_active: true }))).select();
    if (error || !data) return toast('Error', 'error');
    setSchedules((arr) => [...arr.filter((s) => !ids.includes(s.id)), ...data]);
    toast(preset === 'corrido' ? 'Horario corrido aplicado' : 'Horario con descanso aplicado', 'success');
  };

  const createBlock = async (b: { fecha: string; hora_inicio: string; hora_fin: string; motivo: string }) => {
    const { data, error } = await supabase.from('blocked_slots').insert({ profile_id: profileId, ...b }).select().single();
    if (error || !data) return toast('Error', 'error');
    setBlocked((arr) => [...arr, data].sort((a, b) => a.fecha === b.fecha ? a.hora_inicio.localeCompare(b.hora_inicio) : a.fecha.localeCompare(b.fecha)));
    setCreatingBlock(false);
    toast('Bloqueo guardado', 'success');
  };

  const removeBlock = async (id: string) => {
    const { error } = await supabase.from('blocked_slots').delete().eq('id', id);
    if (error) return toast('Error', 'error');
    setBlocked((arr) => arr.filter((b) => b.id !== id));
  };

  return (
    <>
      <PageHeader title="Horarios" subtitle="Define cuándo estás disponible para atender" />

      <div className="mb-5 text-left">
        <h2 className="text-[13px] font-bold text-neutral-400 uppercase tracking-wider mb-3">Días de trabajo</h2>
        <div className="card-premium !p-0 bg-white border border-neutral-200 shadow-sm divide-y divide-neutral-100">
          {DIAS_SEMANA.map((nombre, d) => {
            const ranges = rangesByDay(d);
            const activo = dayIsOpen(d);
            const activeRanges = ranges.filter((r) => r.is_active);
            return (
              <div key={d} className="flex items-center gap-3 px-4 py-3">
                <button type="button" onClick={() => activo && setEditingDay(d)} disabled={!activo}
                  className="group flex min-w-0 flex-1 items-center justify-between gap-3 text-left transition disabled:cursor-default">
                  <div className="min-w-0">
                    <p className="text-[14px] font-bold text-neutral-900">{nombre}</p>
                    {activo && activeRanges.length > 0 ? (
                      <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5">
                        {activeRanges.map((r) => (
                          <span key={r.id} className="text-[12px] font-bold text-black bg-[#d2ff00]/30 px-1 rounded border border-[#d2ff00]/40">{formatHora12(r.hora_inicio)} – {formatHora12(r.hora_fin)}</span>
                        ))}
                      </div>
                    ) : <p className="mt-1 text-[12px] text-neutral-400 font-medium">No trabajas (Cerrado)</p>}
                  </div>
                  {activo && <ChevronRight className="h-4 w-4 text-neutral-400 group-hover:text-black transition-colors" />}
                </button>
                <Switch checked={activo} onChange={() => toggleDay(d)} />
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between mb-3 text-left">
        <h2 className="text-[13px] font-bold text-neutral-400 uppercase tracking-wider">Días bloqueados (vacaciones o eventos)</h2>
        <button onClick={() => setCreatingBlock(true)} className="btn-ghost !h-8 !text-[12px]"><CalendarX className="h-3.5 w-3.5" /> Bloquear horas</button>
      </div>
      {blocked.length === 0 ? (
        <div className="card-premium py-8 bg-white border border-neutral-200 shadow-sm text-center">
          <p className="text-[13px] text-neutral-400 font-medium">No tienes bloqueos próximos</p>
        </div>
      ) : (
        <div className="space-y-2 text-left">
          {blocked.map((b) => (
            <div key={b.id} className="card-premium flex items-center justify-between !p-4 bg-white border border-neutral-200 shadow-sm">
              <div className="min-w-0">
                <p className="text-[14px] font-bold text-neutral-900">{b.fecha.split('-').reverse().join('/')}</p>
                <p className="mt-0.5 text-[12px] text-neutral-500 font-semibold">{formatHora12(b.hora_inicio)} – {formatHora12(b.hora_fin)}{b.motivo ? ` · ${b.motivo}` : ''}</p>
              </div>
              <button onClick={() => removeBlock(b.id)} className="text-neutral-400 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      )}

      <BottomSheet open={editingDay !== null} onClose={() => setEditingDay(null)} title={editingDay !== null ? `Horarios del ${DIAS_SEMANA[editingDay]}` : ''}>
        {editingDay !== null && <DayScheduleEditor day={editingDay} ranges={rangesByDay(editingDay)} onPreset={(p) => applyPreset(editingDay, p)} onAdd={(ini, fin) => addRange(editingDay, ini, fin)} onUpdate={updateRange} onRemove={removeRange} />}
      </BottomSheet>
      <BottomSheet open={creatingBlock} onClose={() => setCreatingBlock(false)} title="Bloquear día u horas">
        <BlockForm onSubmit={createBlock} />
      </BottomSheet>
    </>
  );
}

function DayScheduleEditor({ day, ranges, onPreset, onAdd, onUpdate, onRemove }: { day: number; ranges: Schedule[]; onPreset: (p: 'corrido' | 'descanso') => void; onAdd: (ini: string, fin: string) => void; onUpdate: (id: string, ini: string, fin: string) => void; onRemove: (id: string) => void }) {
  const sorted = ranges.filter((r) => r.is_active);
  const handleAdd = () => { const last = sorted[sorted.length - 1]; const ini = last ? addMinutes(last.hora_fin.slice(0, 5), 60) : '09:00'; const fin = addMinutes(ini, 240); onAdd(ini, fin); };

  return (
    <div className="space-y-5 text-left">
      <div>
        <p className="text-[12px] font-bold text-neutral-500 uppercase tracking-wider mb-2">Presets rápidos</p>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => onPreset('corrido')} className="card-premium-hover !p-3 text-left bg-white border border-neutral-200">
            <p className="text-[14px] font-bold text-neutral-900">Corrido</p>
            <p className="mt-0.5 text-[11px] text-neutral-500 font-semibold">9:00 AM – 6:00 PM</p>
          </button>
          <button type="button" onClick={() => onPreset('descanso')} className="card-premium-hover !p-3 text-left bg-white border border-neutral-200">
            <p className="text-[14px] font-bold text-neutral-900">Con descanso (almuerzo)</p>
            <p className="mt-0.5 text-[11px] text-neutral-500 font-semibold">9–1 PM · 3–7 PM</p>
          </button>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[12px] font-bold text-neutral-500 uppercase tracking-wider">Horas de jornada</p>
          <span className="text-[11px] text-neutral-400 font-bold">{sorted.length} {sorted.length === 1 ? 'bloque' : 'bloques'}</span>
        </div>
        {sorted.length === 0 ? (
          <div className="card-premium text-center py-6 bg-white border border-neutral-200"><p className="text-[13px] text-neutral-400 font-medium">Usa un preset o añade un bloque</p></div>
        ) : (
          <div className="space-y-2">
            {sorted.map((r) => (
              <RangeRow key={r.id} range={r} onUpdate={(ini, fin) => onUpdate(r.id, ini, fin)} onRemove={() => onRemove(r.id)} canRemove={sorted.length > 1} />
            ))}
          </div>
        )}
      </div>

      <button type="button" onClick={handleAdd} className="btn-secondary w-full"><Plus className="h-4 w-4" /> Añadir otra jornada</button>
    </div>
  );
}

function RangeRow({ range, onUpdate, onRemove, canRemove }: { range: Schedule; onUpdate: (ini: string, fin: string) => void; onRemove: () => void; canRemove: boolean }) {
  const [ini, setIni] = useState(range.hora_inicio.slice(0, 5));
  const [fin, setFin] = useState(range.hora_fin.slice(0, 5));
  const commit = (newIni: string, newFin: string) => { if (newIni >= newFin) return; if (newIni === range.hora_inicio.slice(0, 5) && newFin === range.hora_fin.slice(0, 5)) return; onUpdate(newIni, newFin); };
  return (
    <div className="card-premium !p-3 bg-white border border-neutral-200">
      <div className="flex items-center gap-2">
        <input type="time" value={ini} onChange={(e) => setIni(e.target.value)} onBlur={() => commit(ini, fin)} className="input-sm text-center font-bold" />
        <span className="text-neutral-400 font-bold">–</span>
        <input type="time" value={fin} onChange={(e) => setFin(e.target.value)} onBlur={() => commit(ini, fin)} className="input-sm text-center font-bold" />
        {canRemove && <button type="button" onClick={onRemove} className="btn-icon !h-9 !w-9 text-red-500 hover:bg-red-50 shrink-0"><Trash2 className="h-3.5 w-3.5" /></button>}
      </div>
    </div>
  );
}

const addMinutes = (time: string, mins: number) => {
  const [h, m] = time.split(':').map(Number);
  const total = Math.min(h * 60 + m + mins, 23 * 60 + 30);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

function BlockForm({ onSubmit }: { onSubmit: (b: { fecha: string; hora_inicio: string; hora_fin: string; motivo: string }) => void }) {
  const today = new Date().toISOString().split('T')[0];
  const [fecha, setFecha] = useState(today);
  const [ini, setIni] = useState('09:00');
  const [fin, setFin] = useState('18:00');
  const [motivo, setMotivo] = useState('');
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (ini >= fin) return toast('Atención: la hora de inicio debe ser menor', 'error'); onSubmit({ fecha, hora_inicio: ini, hora_fin: fin, motivo }); }} className="space-y-4 text-left">
      <Field label="Fecha"><input type="date" required min={today} value={fecha} onChange={(e) => setFecha(e.target.value)} className="input" /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Desde"><input type="time" required value={ini} onChange={(e) => setIni(e.target.value)} className="input" /></Field>
        <Field label="Hasta"><input type="time" required value={fin} onChange={(e) => setFin(e.target.value)} className="input" /></Field>
      </div>
      <Field label="Motivo (opcional)"><input type="text" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ej: Vacaciones, cumpleaños, diligencia…" className="input" /></Field>
      <button type="submit" className="btn-primary w-full"><CalendarX className="h-4 w-4" /> Bloquear</button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block mb-1.5 text-[12px] font-bold text-neutral-500 uppercase tracking-wider">{label}</label>{children}</div>;
}
