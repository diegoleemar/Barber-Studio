'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CalendarRange, Clock, Phone, DollarSign, User, X, Check, Ban, RotateCw, Receipt, Image, Home, Video } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Appointment, Service } from '@/lib/types';
import { DIAS_CORTOS, MESES, formatHora12, toDateKey, formatFechaLarga } from '@/lib/time';
import PageHeader from '@/components/ui/PageHeader';
import BottomSheet from '@/components/ui/BottomSheet';
import { toast } from '@/components/ui/Toast';

export default function AgendaView({ profileId, services }: { profileId: string; services: Service[] }) {
  const [selected, setSelected] = useState<Date | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'day' | 'week'>('day');
  const [active, setActive] = useState<Appointment | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const today = useMemo(() => mounted ? new Date() : null, [mounted]);

  useEffect(() => {
    if (!selected && mounted) setSelected(new Date());
  }, [mounted, selected]);

  const supabase = useMemo(() => createClient(), []);
  const servicesMap = useMemo(() => new Map(services.map((s) => [s.id, s])), [services]);

  const todayKey = useMemo(() => mounted && today ? toDateKey(today) : '', [mounted, today]);
  const selectedKey = useMemo(() => selected && mounted ? toDateKey(selected) : '', [selected, mounted]);

  const range = useMemo(() => {
    if (!selected) return { from: '', to: '' };
    if (view === 'day') return { from: selectedKey, to: selectedKey };
    const day = selected.getDay();
    const start = new Date(selected);
    start.setDate(selected.getDate() - day);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { from: toDateKey(start), to: toDateKey(end) };
  }, [selectedKey, view, selected]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      const { data } = await supabase
        .from('appointments')
        .select('*')
        .eq('profile_id', profileId)
        .gte('fecha', range.from)
        .lte('fecha', range.to)
        .order('fecha')
        .order('hora');
      if (active) { setAppointments(data || []); setLoading(false); }
    })();
    return () => { active = false; };
  }, [profileId, range, supabase]);

  useEffect(() => {
    const channel = supabase
      .channel(`appointments-${profileId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments', filter: `profile_id=eq.${profileId}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const row = payload.new as Appointment;
          if (row.fecha >= range.from && row.fecha <= range.to) {
            setAppointments((arr) => [...arr, row].sort((a, b) => a.fecha === b.fecha ? a.hora.localeCompare(b.hora) : a.fecha.localeCompare(b.fecha)));
            toast('¡Epa, tienes una nueva reserva en lista!', 'success');
          }
        } else if (payload.eventType === 'UPDATE') {
          const row = payload.new as Appointment;
          setAppointments((arr) => arr.map((a) => a.id === row.id ? row : a));
        } else if (payload.eventType === 'DELETE') {
          const row = payload.old as Appointment;
          setAppointments((arr) => arr.filter((a) => a.id !== row.id));
        }
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [profileId, range, supabase]);

  const updateStatus = useCallback(async (id: string, status: Appointment['status']) => {
    const { error } = await supabase.from('appointments').update({ status }).eq('id', id);
    if (error) { toast('Error al actualizar', 'error'); return; }
    setAppointments((arr) => arr.map((a) => a.id === id ? { ...a, status } : a));
    if (active?.id === id) setActive({ ...active, status });
    toast(status === 'confirmed' ? 'Cita confirmada al pelo' : status === 'cancelled' ? 'Cita cancelada' : 'Actualizado', 'success');
  }, [supabase, active]);

  const dayStrip = useMemo(() => {
    if (!today) return [];
    const base = new Date(today); base.setHours(0, 0, 0, 0);
    return Array.from({ length: 14 }, (_, i) => { const d = new Date(base); d.setDate(base.getDate() + i); return d; });
  }, [today]);

  const filtered = selectedKey ? appointments.filter((a) => view === 'week' || a.fecha === selectedKey) : [];

  const counts = {
    total: filtered.length,
    pending: filtered.filter((a) => a.status === 'pending').length,
    confirmed: filtered.filter((a) => a.status === 'confirmed').length
  };

  return (
    <>
      <PageHeader
        title="Mi Agenda"
        subtitle={selected ? formatFechaLarga(selected) : ''}
        action={
          <div className="flex items-center gap-1 rounded-lg border border-base-border bg-[#FAF9F6] p-0.5 shadow-sm">
            {(['day', 'week'] as const).map((v) => (
              <button key={v} onClick={() => setView(v)}
                className={`rounded-md px-3 py-1.5 text-[13px] font-bold transition-all duration-150 ${
                  view === v ? 'bg-[#d2ff00] text-black shadow-sm' : 'text-neutral-500 hover:text-black'
                }`}>
                {v === 'day' ? 'Día' : 'Semana'}
              </button>
            ))}
          </div>
        }
      />

      {/* Day strip */}
      {mounted && <div className="mb-5 -mx-4 overflow-x-auto px-4 no-scrollbar lg:-mx-8 lg:px-8">
        <div className="flex gap-1.5 w-max">
          {dayStrip.map((d) => {
            const key = toDateKey(d);
            const isSel = key === selectedKey;
            const isToday = key === todayKey;
            return (
              <motion.button key={key} whileTap={{ scale: 0.95 }} onClick={() => setSelected(d)}
                className={`touch-target-sm relative flex h-14 w-11 shrink-0 flex-col items-center justify-center rounded-xl text-center transition-all duration-200 lg:h-16 lg:w-12 border ${
                  isSel ? 'bg-[#d2ff00] text-black border-black/10 shadow-sm' : isToday ? 'bg-white border-black text-neutral-900 font-extrabold' : 'bg-white border-neutral-200 text-neutral-400 hover:bg-neutral-50 hover:text-neutral-700'
                }`}>
                <span className={`text-[8px] font-bold uppercase tracking-wider lg:text-[9px] ${isSel ? 'text-black/60' : 'text-neutral-400'}`}>{DIAS_CORTOS[d.getDay()].slice(0, 2)}</span>
                <span className="mt-px text-[15px] font-bold leading-none lg:text-[17px]">{d.getDate()}</span>
              </motion.button>
            );
          })}
        </div>
      </div>}

      {/* Stats */}
      <div className="mb-5 grid grid-cols-3 gap-2 lg:gap-3">
        <StatsCard label="Total" value={counts.total} />
        <StatsCard label="Por confirmar" value={counts.pending} accent />
        <StatsCard label="Confirmadas" value={counts.confirmed} confirmed />
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-[68px]" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((a) => {
              const svc = a.service_id ? servicesMap.get(a.service_id) : null;
              return (
                <motion.button key={a.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  onClick={() => setActive(a)} className="touch-target card-premium-hover w-full text-left bg-white border border-neutral-200 p-3.5 rounded-xl shadow-sm hover:shadow-md transition">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl lg:h-10 lg:w-10 border ${
                        a.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' : a.status === 'cancelled' ? 'bg-red-500/10 text-red-700 border-red-500/20' : 'bg-[#d2ff00]/10 text-black border-[#d2ff00]/30'
                      }`}>
                        <Clock className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[14px] font-bold text-neutral-900 lg:text-[15px]">{formatHora12(a.hora)}</span>
                          {view === 'week' && <span className="text-[10px] text-neutral-400 font-bold lg:text-[11px]">{a.fecha.split('-').slice(1).reverse().join('/')}</span>}
                        </div>
                        <p className="truncate text-[13px] font-bold text-neutral-800 lg:text-[14px]">{a.cliente_nombre}</p>
                        <p className="truncate text-[11px] text-neutral-500 lg:text-[12px] font-semibold">
                          {svc?.name || 'Sin servicio'}
                          {a.appointment_type && a.appointment_type !== 'in_person' && (
                            <span className="ml-1.5 inline-flex items-center gap-0.5 text-[10px] text-neutral-400 font-medium">
                              {a.appointment_type === 'online' ? '· Online' : '· A domicilio'}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <BottomSheet open={!!active} onClose={() => setActive(null)} title="Detalle de cita">
        {active && <AppointmentDetail appt={active} service={active.service_id ? servicesMap.get(active.service_id) || null : null} onUpdate={(s) => updateStatus(active.id, s)} />}
      </BottomSheet>
    </>
  );
}

/* ─── Stat Card ─── */
const StatsCard = ({ label, value, accent, confirmed }: { label: string; value: number; accent?: boolean; confirmed?: boolean }) => (
  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card-premium !p-3 lg:!p-4 bg-white shadow-sm border border-neutral-200 flex flex-col text-left">
    <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 lg:text-label">{label}</p>
    <p className={`mt-1 text-[22px] font-extrabold tracking-tight lg:mt-1.5 lg:text-[28px] ${accent ? 'text-amber-600' : confirmed ? 'text-emerald-600' : 'text-neutral-900'}`}>
      {value}
    </p>
  </motion.div>
);

/* ─── Status Badge ─── */
const StatusBadge = ({ status }: { status: Appointment['status'] }) => {
  const map = {
    pending: { label: 'Por confirmar', cls: 'badge-pending' },
    confirmed: { label: 'Confirmada', cls: 'badge-confirmed' },
    cancelled: { label: 'Cancelada', cls: 'badge-cancelled' }
  } as const;
  return <span className={map[status].cls}>{map[status].label}</span>;
};

/* ─── Empty State ─── */
const EmptyState = () => (
  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card-premium flex flex-col items-center py-12 text-center lg:py-16 bg-white border border-neutral-200 shadow-sm">
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 border border-neutral-200">
      <CalendarRange className="h-5 w-5 text-neutral-500 lg:h-6 lg:w-6" />
    </div>
    <h3 className="text-[15px] font-bold text-neutral-900 lg:text-[16px]">Tu agenda está limpia</h3>
    <p className="mt-1 max-w-[260px] text-[12px] text-neutral-500 lg:max-w-xs lg:text-[13px] font-medium">Cuando un cliente reserve, te aparecerá aquí de una y en tiempo real.</p>
  </motion.div>
);

/* ─── Appointment Detail ─── */
function AppointmentDetail({ appt, service, onUpdate }: { appt: Appointment; service: Service | null; onUpdate: (s: Appointment['status']) => void }) {
  return (
    <div className="space-y-4 text-left">
      <div className="card-premium !p-4 bg-white border border-neutral-200">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Estado</span>
          <StatusBadge status={appt.status} />
        </div>
        <div className="divider-light my-3" />

        <div className="space-y-3 font-semibold text-neutral-700">
          <Row icon={CalendarRange} label="Fecha" value={appt.fecha.split('-').reverse().join('/')} />
          <Row icon={Clock} label="Hora" value={formatHora12(appt.hora)} highlight />
          <Row icon={User} label="Cliente" value={appt.cliente_nombre} />
          <Row icon={Phone} label="Teléfono" value={appt.cliente_telefono} link={`tel:${appt.cliente_telefono}`} />
          <Row icon={ServiceIcon} label="Servicio" value={service?.name || '—'} />
          {service && <Row icon={DollarSign} label="Precio" value={`$${service.price}`} highlight />}
          {appt.appointment_type && appt.appointment_type !== 'in_person' && (
            <Row icon={appt.appointment_type === 'online' ? Video : Home} label="Tipo" value={appt.appointment_type === 'online' ? 'Online' : 'A domicilio'} />
          )}
          {appt.address && <Row icon={Home} label="Dirección" value={appt.address} />}
        </div>
      </div>

      {appt.comprobante_url && (
        <div className="card-premium !p-4 bg-white border border-neutral-200">
          <div className="flex items-center gap-2 mb-3">
            <Receipt className="h-4 w-4 text-neutral-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Captura de pago</span>
          </div>
          {appt.comprobante_url.match(/\.(jpe?g|png|webp|gif)$/i) ? (
            <img src={appt.comprobante_url} alt="Comprobante" className="w-full rounded-lg ring-1 ring-neutral-200" />
          ) : (
            <a href={appt.comprobante_url} target="_blank" rel="noreferrer" className="btn-secondary w-full text-center py-2 text-[13px] font-bold">
              <Image className="h-4 w-4 inline mr-1" /> Abrir captura de pago
            </a>
          )}
        </div>
      )}

      {appt.notes && (
        <div className="card-premium !p-4 bg-white border border-neutral-200">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Notas de tu cliente</span>
          <p className="mt-2 text-[13px] text-neutral-600 font-medium">{appt.notes}</p>
        </div>
      )}

      <div className="space-y-2 pt-2">
        {appt.status === 'pending' && (
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => onUpdate('cancelled')} className="btn-danger w-full"><Ban className="h-4 w-4" /> Rechazar</button>
            <button onClick={() => onUpdate('confirmed')} className="btn-primary w-full"><Check className="h-4 w-4" /> Confirmar</button>
          </div>
        )}
        {appt.status === 'confirmed' && (
          <button onClick={() => onUpdate('cancelled')} className="btn-danger w-full"><X className="h-4 w-4" /> Cancelar cita</button>
        )}
        {appt.status === 'cancelled' && (
          <button onClick={() => onUpdate('confirmed')} className="btn-primary w-full"><RotateCw className="h-4 w-4" /> Reactivar</button>
        )}
      </div>
    </div>
  );
}

const Row = ({ icon: Icon, label, value, link, highlight }: { icon: any; label: string; value: string; link?: string; highlight?: boolean }) => (
  <div className="flex items-center justify-between gap-2 text-[13px]">
    <div className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 text-neutral-400" />
      <span className="text-[12px] text-neutral-500 font-bold uppercase tracking-wider">{label}</span>
    </div>
    {link ? (
      <a href={link} className={`font-bold ${highlight ? 'text-black bg-[#d2ff00]/40 px-1 rounded' : 'text-neutral-900'} hover:underline`}>{value}</a>
    ) : (
      <span className={`font-bold ${highlight ? 'text-black bg-[#d2ff00]/40 px-1 rounded' : 'text-neutral-900'}`}>{value}</span>
    )}
  </div>
);

const ServiceIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M8.5 8.5L20 20M8.5 15.5L20 5" />
  </svg>
);
