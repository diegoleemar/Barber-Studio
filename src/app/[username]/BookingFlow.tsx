'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type {
  Appointment,
  Barber,
  BlockedSlot,
  PaymentMethod,
  Schedule,
  Service
} from '@/lib/types';
import {
  DIAS_CORTOS,
  MESES,
  formatFechaLarga,
  formatHora12,
  generateSlots,
  timeToMinutes,
  toDateKey
} from '@/lib/time';
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Clock, Upload, Scissors } from 'lucide-react';
import IOSCalendar from './IOSCalendar';
import PaymentInfoCard from './PaymentInfoCard';

type Step = 1 | 2 | 3 | 4;

export default function BookingFlow({
  barber,
  services,
  schedules,
  payments
}: {
  barber: Barber;
  services: Service[];
  schedules: Schedule[];
  payments: PaymentMethod[];
}) {
  const [step, setStep] = useState<Step>(1);
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [serviceId, setServiceId] = useState<string | null>(services[0]?.id || null);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [comprobante, setComprobante] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedId, setConfirmedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [busy, setBusy] = useState<Appointment[]>([]);
  const [blocked, setBlocked] = useState<BlockedSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const supabase = useMemo(() => createClient(), []);
  const service = services.find((s) => s.id === serviceId) || null;

  useEffect(() => {
    if (!date) return;
    let active = true;
    setLoadingSlots(true);
    const key = toDateKey(date);
    (async () => {
      const [{ data: appts }, { data: blk }] = await Promise.all([
        supabase
          .from('appointments')
          .select('id,fecha,hora,status,service_id')
          .eq('barber_id', barber.id)
          .eq('fecha', key)
          .in('status', ['pending', 'confirmed']),
        supabase
          .from('blocked_slots')
          .select('*')
          .eq('barber_id', barber.id)
          .eq('fecha', key)
      ]);
      if (!active) return;
      setBusy((appts || []) as Appointment[]);
      setBlocked(blk || []);
      setLoadingSlots(false);
    })();
    return () => { active = false; };
  }, [date, barber.id, supabase]);

  const availableSlots = useMemo(() => {
    if (!date) return [];
    const dow = date.getDay();
    const daySchedules = schedules.filter((s) => s.dia_semana === dow);
    if (daySchedules.length === 0) return [];

    const slots: string[] = [];
    daySchedules.forEach((sch) => {
      const partial = generateSlots(
        sch.hora_inicio.slice(0, 5),
        sch.hora_fin.slice(0, 5),
        barber.intervalo_minutos
      );
      partial.forEach((t) => { if (!slots.includes(t)) slots.push(t); });
    });
    slots.sort();

    const isToday = toDateKey(date) === toDateKey(new Date());
    const nowMin = isToday ? new Date().getHours() * 60 + new Date().getMinutes() : -1;

    const busyMins = new Set<number>();
    busy.forEach((a) => {
      const svc = services.find((s) => s.id === a.service_id);
      const dur = svc?.duracion_min || barber.intervalo_minutos;
      const start = timeToMinutes(a.hora.slice(0, 5));
      for (let m = start; m < start + dur; m += barber.intervalo_minutos) busyMins.add(m);
    });

    blocked.forEach((b) => {
      const s = timeToMinutes(b.hora_inicio.slice(0, 5));
      const e = timeToMinutes(b.hora_fin.slice(0, 5));
      for (let m = s; m < e; m += barber.intervalo_minutos) busyMins.add(m);
    });

    return slots.map((s) => {
      const m = timeToMinutes(s);
      const past = isToday && m <= nowMin;
      return { time: s, available: !busyMins.has(m) && !past };
    });
  }, [date, schedules, busy, blocked, services, barber.intervalo_minutos]);

  const availableDayChecker = (d: Date) => {
    const dow = d.getDay();
    return schedules.some((s) => s.dia_semana === dow);
  };

  const submit = async () => {
    if (!date || !time || !service) return;
    setSubmitting(true);
    setErrorMsg(null);

    let comprobante_url: string | null = null;
    if (comprobante) {
      const ext = comprobante.name.split('.').pop();
      const path = `${barber.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('comprobantes')
        .upload(path, comprobante, { cacheControl: '3600', upsert: false });
      if (upErr) { setErrorMsg('No se pudo subir el comprobante. Intenta de nuevo.'); setSubmitting(false); return; }
      const { data } = supabase.storage.from('comprobantes').getPublicUrl(path);
      comprobante_url = data.publicUrl;
    }

    const { data: created, error } = await supabase
      .from('appointments')
      .insert({
        barber_id: barber.id,
        service_id: service.id,
        cliente_nombre: nombre.trim(),
        cliente_telefono: telefono.trim(),
        fecha: toDateKey(date),
        hora: time,
        status: 'pending',
        comprobante_url
      })
      .select()
      .single();

    setSubmitting(false);
    if (error || !created) { setErrorMsg('No se pudo crear la reserva. Intenta de nuevo.'); return; }
    setConfirmedId(created.id);
    setStep(4);
  };

  if (confirmedId) {
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center px-5 py-12 bg-base-950">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand/10 ring-4 ring-brand/20">
          <Check className="h-10 w-10 text-brand" />
        </div>
        <h1 className="text-[22px] font-bold text-label-primary text-center">¡Reserva enviada!</h1>
        <p className="mt-3 max-w-sm text-center text-[14px] text-label-secondary leading-relaxed">
          Tu cita está en revisión. {barber.nombre} te confirmará pronto.
        </p>

        <div className="mt-8 w-full max-w-sm rounded-2xl border border-[#222] bg-black p-5">
          <div className="flex items-center justify-between py-2">
            <span className="text-[13px] text-label-tertiary">Fecha</span>
            <span className="text-[14px] font-medium text-label-primary">{formatFechaLarga(date!)}</span>
          </div>
          <div className="my-2 h-px bg-[#222]" />
          <div className="flex items-center justify-between py-2">
            <span className="text-[13px] text-label-tertiary">Hora</span>
            <span className="text-[14px] font-semibold text-brand">{formatHora12(time!)}</span>
          </div>
          <div className="my-2 h-px bg-[#222]" />
          {service && (
            <>
              <div className="flex items-center justify-between py-2">
                <span className="text-[13px] text-label-tertiary">Servicio</span>
                <span className="text-[14px] font-medium text-label-primary">{service.nombre}</span>
              </div>
            </>
          )}
        </div>

        <button onClick={() => { setStep(1); setDate(null); setTime(null); setNombre(''); setTelefono(''); setComprobante(null); setConfirmedId(null); }}
          className="mt-8 inline-flex items-center gap-2 rounded-xl border border-[#333] px-6 py-2.5 text-[14px] font-medium text-label-secondary hover:text-label-primary transition">
          Hacer otra reserva
        </button>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-base-950 pb-32">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-[#222] bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3 pt-[max(env(safe-area-inset-top),12px)]">
          <Link href="/" className="touch-target-sm -ml-1 flex h-8 w-8 items-center justify-center rounded-lg text-label-secondary hover:text-label-primary transition">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          {barber.foto_url ? (
            <img src={barber.foto_url} alt={barber.nombre} className="h-9 w-9 rounded-full object-cover ring-1 ring-brand/30" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-base-700 text-[13px] font-semibold text-label-secondary">
              {barber.nombre.charAt(0)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold text-label-primary">{barber.nombre}</p>
            <p className="text-[12px] text-label-tertiary">Reserva tu cita</p>
          </div>
        </div>
        <StepIndicator step={step} />
      </header>

      <div className="mx-auto max-w-2xl px-4 pt-6">
        {barber.descripcion && step === 1 && (
          <p className="mb-6 text-center text-[14px] text-label-secondary leading-relaxed">{barber.descripcion}</p>
        )}

        {/* PASO 1: Fecha y hora */}
        {step === 1 && (
          <>
            <h2 className="text-[20px] font-bold text-label-primary">Elige día y hora</h2>
            <p className="mt-1 text-[14px] text-label-secondary">Selecciona cuándo quieres tu cita</p>

            <div className="mt-5 rounded-2xl border border-[#222] bg-black p-4">
              <IOSCalendar
                value={date}
                onChange={(d) => { setDate(d); setTime(null); }}
                isDayAvailable={availableDayChecker}
              />
            </div>

            {date && (
              <div className="mt-6 animate-fade-up">
                <p className="flex items-center gap-2 text-[13px] font-semibold text-label-secondary mb-3">
                  <Clock className="h-4 w-4" /> Horarios disponibles — {formatFechaLarga(date)}
                </p>
                <div className="rounded-2xl border border-[#222] bg-black p-4">
                  {loadingSlots ? (
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-11 animate-pulse rounded-xl bg-base-800" />
                      ))}
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <p className="text-center text-[14px] text-label-tertiary py-6">No hay horarios disponibles para este día</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {availableSlots.map((s) => (
                        <button key={s.time} disabled={!s.available} onClick={() => setTime(s.time)}
                          className={`touch-target-sm h-11 rounded-xl text-[14px] font-semibold transition-all duration-150 ${
                            time === s.time
                              ? 'bg-brand text-white shadow-glow'
                              : s.available
                                ? 'bg-base-800 text-label-primary hover:bg-base-700'
                                : 'bg-base-800/50 text-label-quaternary line-through cursor-not-allowed'
                          }`}>
                          {formatHora12(s.time)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <StickyCTA
              disabled={!date || !time}
              label="Continuar"
              onClick={() => setStep(2)}
              info={time && date ? `${formatFechaLarga(date)} · ${formatHora12(time)}` : ''}
            />
          </>
        )}

        {/* PASO 2: Datos del cliente */}
        {step === 2 && (
          <>
            <h2 className="text-[20px] font-bold text-label-primary">Tus datos</h2>
            <p className="mt-1 text-[14px] text-label-secondary">Te contactaremos por este número</p>

            <div className="mt-5 rounded-2xl border border-[#222] bg-black p-5 space-y-4">
              <div>
                <label className="text-[12px] font-medium text-label-tertiary mb-1.5 block">Nombre y apellido</label>
                <input type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Carlos Pérez" className="input" />
              </div>
              <div>
                <label className="text-[12px] font-medium text-label-tertiary mb-1.5 block">Teléfono / WhatsApp</label>
                <input type="tel" required value={telefono} onChange={(e) => setTelefono(e.target.value)}
                  placeholder="0412-1234567" className="input" />
              </div>
            </div>

            <h3 className="mt-8 text-[17px] font-semibold text-label-primary">Selecciona el servicio</h3>
            {services.length === 0 ? (
              <p className="mt-3 text-center text-[14px] text-label-tertiary py-6">Este barbero aún no tiene servicios configurados.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {services.map((s) => (
                  <button key={s.id} onClick={() => setServiceId(s.id)}
                    className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-all duration-150 ${
                      serviceId === s.id
                        ? 'border-brand/40 bg-brand/[0.03] ring-1 ring-brand/20'
                        : 'border-[#222] bg-black hover:border-[#333]'
                    }`}>
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        serviceId === s.id ? 'bg-brand/10 text-brand' : 'bg-base-800 text-label-tertiary'
                      }`}>
                        <Scissors className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[15px] font-medium text-label-primary">{s.nombre}</p>
                        <p className="text-[12px] text-label-tertiary">{s.duracion_min} min</p>
                      </div>
                    </div>
                    <span className="text-[17px] font-bold text-brand">${s.precio}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button onClick={() => setStep(1)}
                className="h-12 rounded-xl border border-[#333] text-[14px] font-medium text-label-secondary hover:text-label-primary hover:border-[#444] transition">
                Atrás
              </button>
              <button onClick={() => setStep(3)} disabled={!nombre || !telefono || !service}
                className="btn-primary disabled:opacity-40 !h-12 !text-[15px]">
                Continuar
              </button>
            </div>
          </>
        )}

        {/* PASO 3: Pago */}
        {step === 3 && (
          <>
            <h2 className="text-[20px] font-bold text-label-primary">Confirma y paga</h2>
            <p className="mt-1 text-[14px] text-label-secondary">Usa cualquiera de los métodos disponibles</p>

            <div className="mt-5 rounded-2xl border border-[#222] bg-black p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-label-tertiary">Fecha</span>
                <span className="text-[15px] font-medium text-label-primary">{formatFechaLarga(date!)}</span>
              </div>
              <div className="h-px bg-[#222]" />
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-label-tertiary">Hora</span>
                <span className="text-[15px] font-semibold text-brand">{formatHora12(time!)}</span>
              </div>
              <div className="h-px bg-[#222]" />
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-label-tertiary">Servicio</span>
                <span className="text-[15px] font-medium text-label-primary">{service?.nombre}</span>
              </div>
              <div className="h-px bg-[#222]" />
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-label-tertiary">Total</span>
                <span className="text-[22px] font-bold text-brand">${service?.precio}</span>
              </div>
            </div>

            <h3 className="mt-8 text-[17px] font-semibold text-label-primary">Métodos de pago</h3>
            {payments.length === 0 ? (
              <div className="mt-3 rounded-2xl border border-[#222] bg-black p-5 text-center text-[14px] text-label-tertiary">
                Este barbero aún no configuró métodos de pago. Contáctalo directamente.
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                {payments.map((p) => <PaymentInfoCard key={p.id} method={p} />)}
              </div>
            )}

            <h3 className="mt-8 text-[17px] font-semibold text-label-primary">Sube tu comprobante</h3>
            <p className="mt-1 text-[13px] text-label-tertiary">Imagen o PDF del pago (opcional)</p>
            <label className="mt-3 flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-[#333] bg-black p-4 hover:border-brand/40 transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <Upload className="h-5 w-5" />
              </div>
              <span className="flex-1 truncate text-[14px] text-label-secondary">
                {comprobante ? comprobante.name : 'Toca para subir'}
              </span>
              <input type="file" accept="image/*,application/pdf" hidden onChange={(e) => setComprobante(e.target.files?.[0] || null)} />
            </label>

            {errorMsg && <p className="mt-4 text-center text-[14px] text-red-400">{errorMsg}</p>}

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button onClick={() => setStep(2)}
                className="h-12 rounded-xl border border-[#333] text-[14px] font-medium text-label-secondary hover:text-label-primary hover:border-[#444] transition">
                Atrás
              </button>
              <button onClick={submit} disabled={submitting}
                className="btn-primary disabled:opacity-40 !h-12 !text-[15px]">
                {submitting ? 'Enviando…' : 'Confirmar reserva'}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

const StepIndicator = ({ step }: { step: Step }) => (
  <div className="mx-auto flex max-w-2xl gap-1.5 px-4 pb-3">
    {[1, 2, 3].map((n) => (
      <div key={n} className={`h-1 flex-1 rounded-full transition-colors ${
        n <= step ? 'bg-brand' : 'bg-base-700'
      }`} />
    ))}
  </div>
);

const StickyCTA = ({ label, onClick, disabled, info }: {
  label: string; onClick: () => void; disabled?: boolean; info?: string;
}) => (
  <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-[#222] bg-black/80 backdrop-blur-xl px-4 pb-[max(env(safe-area-inset-bottom),16px)] pt-4">
    <div className="mx-auto flex max-w-2xl flex-col gap-2">
      {info && <p className="text-center text-[12px] text-label-secondary">{info}</p>}
      <button onClick={onClick} disabled={disabled}
        className="btn-primary w-full disabled:opacity-40 !h-12 !text-[15px]">
        {label}
      </button>
    </div>
  </div>
);
