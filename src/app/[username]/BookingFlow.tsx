'use client';

import { useEffect, useMemo, useState } from 'react';
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
    return () => {
      active = false;
    };
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
      partial.forEach((t) => {
        if (!slots.includes(t)) slots.push(t);
      });
    });
    slots.sort();

    const isToday = toDateKey(date) === toDateKey(new Date());
    const nowMin = isToday ? new Date().getHours() * 60 + new Date().getMinutes() : -1;

    const busyMins = new Set<number>();
    busy.forEach((a) => {
      const svc = services.find((s) => s.id === a.service_id);
      const dur = svc?.duracion_min || barber.intervalo_minutos;
      const start = timeToMinutes(a.hora.slice(0, 5));
      for (let m = start; m < start + dur; m += barber.intervalo_minutos) {
        busyMins.add(m);
      }
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
      if (upErr) {
        setErrorMsg('No se pudo subir el comprobante. Intenta de nuevo.');
        setSubmitting(false);
        return;
      }
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
    if (error || !created) {
      setErrorMsg('No se pudo crear la reserva. Intenta de nuevo.');
      return;
    }
    setConfirmedId(created.id);
    setStep(4);
  };

  if (confirmedId) {
    return (
      <Confirmation
        barber={barber}
        service={service}
        date={date!}
        time={time!}
        onReset={() => {
          setStep(1);
          setDate(null);
          setTime(null);
          setNombre('');
          setTelefono('');
          setComprobante(null);
          setConfirmedId(null);
        }}
      />
    );
  }

  return (
    <main className="relative min-h-screen pb-32">
      {/* Header */}
      <header className="ios-glass sticky top-0 z-20 border-b border-ink-divider">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-5 py-3">
          {barber.foto_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={barber.foto_url}
              alt={barber.nombre}
              className="h-10 w-10 rounded-full object-cover ring-1 ring-gold/40"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-700">
              {barber.nombre.charAt(0)}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-headline">{barber.nombre}</p>
            <p className="text-[12px] text-label-tertiary">Reserva tu cita</p>
          </div>
        </div>
        <StepIndicator step={step} />
      </header>

      <div className="mx-auto max-w-2xl px-5 pt-6">
        {barber.descripcion && step === 1 && (
          <p className="mb-6 text-center text-label-secondary">{barber.descripcion}</p>
        )}

        {/* PASO 1: Fecha y hora */}
        {step === 1 && (
          <>
            <h2 className="text-title">Elige día y hora</h2>
            <p className="mt-1 text-label-secondary">
              Selecciona cuándo quieres tu cita
            </p>

            <div className="mt-6 ios-card-lg">
              <IOSCalendar
                value={date}
                onChange={(d) => {
                  setDate(d);
                  setTime(null);
                }}
                isDayAvailable={availableDayChecker}
              />
            </div>

            {date && (
              <div className="mt-6">
                <p className="text-[13px] uppercase tracking-wider text-label-secondary">
                  {formatFechaLarga(date)}
                </p>
                <div className="mt-3 ios-card-lg">
                  {loadingSlots ? (
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="shimmer h-10 rounded-pill" />
                      ))}
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <p className="text-center text-footnote py-4">
                      No hay horarios para este día
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {availableSlots.map((s) => (
                        <button
                          key={s.time}
                          disabled={!s.available}
                          onClick={() => setTime(s.time)}
                          className={`h-10 rounded-pill text-[14px] font-semibold transition ${
                            time === s.time
                              ? 'bg-gold text-black'
                              : s.available
                                ? 'bg-ink-700 text-white hover:bg-ink-600'
                                : 'bg-ink-800 text-label-tertiary line-through'
                          }`}
                        >
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

        {/* PASO 2: Datos del cliente y servicio */}
        {step === 2 && (
          <>
            <h2 className="text-title">Tus datos</h2>
            <p className="mt-1 text-label-secondary">Te contactaremos por este número</p>

            <div className="mt-6 ios-card-lg space-y-4">
              <div>
                <label className="ios-label">Nombre y apellido</label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Carlos Pérez"
                  className="ios-input"
                />
              </div>
              <div>
                <label className="ios-label">Teléfono / WhatsApp</label>
                <input
                  type="tel"
                  required
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="0412-1234567"
                  className="ios-input"
                />
              </div>
            </div>

            <h3 className="mt-8 text-headline">Selecciona el servicio</h3>
            {services.length === 0 ? (
              <p className="mt-3 text-center text-footnote">
                Este barbero aún no tiene servicios.
              </p>
            ) : (
              <div className="mt-3 space-y-2">
                {services.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setServiceId(s.id)}
                    className={`flex w-full items-center justify-between rounded-ios p-4 text-left transition ${
                      serviceId === s.id
                        ? 'bg-gold/10 ring-2 ring-gold'
                        : 'bg-ink-800 ring-2 ring-transparent hover:bg-ink-700'
                    }`}
                  >
                    <div>
                      <p className="text-headline">{s.nombre}</p>
                      <p className="text-footnote">{s.duracion_min} min</p>
                    </div>
                    <span className="text-headline text-gold">${s.precio}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button onClick={() => setStep(1)} className="ios-btn-secondary">
                Atrás
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!nombre || !telefono || !service}
                className="ios-btn-primary disabled:opacity-50"
              >
                Continuar
              </button>
            </div>
          </>
        )}

        {/* PASO 3: Pago */}
        {step === 3 && (
          <>
            <h2 className="text-title">Confirma y paga</h2>
            <p className="mt-1 text-label-secondary">
              Usa cualquiera de los métodos disponibles
            </p>

            <div className="mt-6 ios-card-lg">
              <div className="ios-row !py-2">
                <span className="text-footnote">Fecha</span>
                <span className="text-body">{formatFechaLarga(date!)}</span>
              </div>
              <div className="ios-divider" />
              <div className="ios-row !py-2">
                <span className="text-footnote">Hora</span>
                <span className="text-body font-medium text-gold">{formatHora12(time!)}</span>
              </div>
              <div className="ios-divider" />
              <div className="ios-row !py-2">
                <span className="text-footnote">Servicio</span>
                <span className="text-body">{service?.nombre}</span>
              </div>
              <div className="ios-divider" />
              <div className="ios-row !py-2">
                <span className="text-footnote">Total</span>
                <span className="text-[22px] font-bold text-gold">${service?.precio}</span>
              </div>
            </div>

            <h3 className="mt-8 text-headline">Métodos de pago</h3>
            {payments.length === 0 ? (
              <div className="mt-3 ios-card text-center text-footnote">
                Este barbero aún no configuró métodos de pago. Contáctalo directamente.
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                {payments.map((p) => (
                  <PaymentInfoCard key={p.id} method={p} />
                ))}
              </div>
            )}

            <h3 className="mt-8 text-headline">Sube tu comprobante</h3>
            <p className="mt-1 text-footnote">Imagen o PDF del pago realizado (opcional)</p>
            <label className="mt-3 flex cursor-pointer items-center gap-3 rounded-ios bg-ink-700 p-4 hover:bg-ink-600 transition">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold text-black">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" d="M12 5v14M5 12h14" />
                </svg>
              </div>
              <span className="flex-1 truncate text-body">
                {comprobante ? comprobante.name : 'Toca para subir'}
              </span>
              <input
                type="file"
                accept="image/*,application/pdf"
                hidden
                onChange={(e) => setComprobante(e.target.files?.[0] || null)}
              />
            </label>

            {errorMsg && (
              <p className="mt-4 text-center text-[14px] text-red-400">{errorMsg}</p>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button onClick={() => setStep(2)} className="ios-btn-secondary">
                Atrás
              </button>
              <button onClick={submit} disabled={submitting} className="ios-btn-primary">
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
  <div className="mx-auto flex max-w-2xl gap-1.5 px-5 pb-3">
    {[1, 2, 3].map((n) => (
      <div
        key={n}
        className={`h-1 flex-1 rounded-full transition-colors ${
          n <= step ? 'bg-gold' : 'bg-ink-600'
        }`}
      />
    ))}
  </div>
);

const StickyCTA = ({
  label,
  onClick,
  disabled,
  info
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  info?: string;
}) => (
  <div className="ios-glass fixed bottom-0 left-0 right-0 z-20 border-t border-ink-divider px-5 pb-[max(env(safe-area-inset-bottom),16px)] pt-4">
    <div className="mx-auto flex max-w-2xl flex-col gap-2">
      {info && <p className="text-center text-[12px] text-label-secondary">{info}</p>}
      <button onClick={onClick} disabled={disabled} className="ios-btn-primary w-full disabled:opacity-50">
        {label}
      </button>
    </div>
  </div>
);

function Confirmation({
  barber,
  service,
  date,
  time,
  onReset
}: {
  barber: Barber;
  service: Service | null;
  date: Date;
  time: string;
  onReset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-5 py-12 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gold/15 ring-4 ring-gold/30">
        <svg viewBox="0 0 24 24" className="h-12 w-12 text-gold" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-title">¡Reserva enviada!</h1>
      <p className="mt-3 max-w-sm text-label-secondary">
        Tu cita está en revisión. {barber.nombre} confirmará en breve por WhatsApp.
      </p>

      <div className="mt-8 w-full max-w-sm ios-card-lg">
        <div className="ios-row !py-2">
          <span className="text-footnote">Fecha</span>
          <span className="text-body">{formatFechaLarga(date)}</span>
        </div>
        <div className="ios-divider" />
        <div className="ios-row !py-2">
          <span className="text-footnote">Hora</span>
          <span className="text-body text-gold">{formatHora12(time)}</span>
        </div>
        {service && (
          <>
            <div className="ios-divider" />
            <div className="ios-row !py-2">
              <span className="text-footnote">Servicio</span>
              <span className="text-body">{service.nombre}</span>
            </div>
          </>
        )}
      </div>

      <button onClick={onReset} className="ios-btn-ghost mt-8">
        Hacer otra reserva
      </button>
    </main>
  );
}
