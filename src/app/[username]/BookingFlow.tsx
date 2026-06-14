'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type {
  Appointment,
  Profile,
  Profession,
  BlockedSlot,
  PaymentMethod,
  Schedule,
  Service,
  SlotConfig,
} from '@/lib/types';
import {
  formatFechaLarga,
  formatHora12,
  generateSlotsByFlow,
  timeToMinutes,
  toDateKey,
  professionToSlotConfig,
} from '@/lib/time';
import {
  ArrowLeft,
  Check,
  Clock,
  Upload,
  Scissors,
  Music,
  Stethoscope,
  Home,
  Video,
  type LucideIcon,
} from 'lucide-react';
import IOSCalendar from './IOSCalendar';
import PaymentInfoCard from './PaymentInfoCard';

type Step = 1 | 2 | 3 | 4;

const PROFESSION_ICONS: Record<string, LucideIcon> = {
  barbero: Scissors,
  estilista: Scissors,
  manicurista: Scissors,
  medico_general: Stethoscope,
  medico_especialista: Stethoscope,
  odontologo: Stethoscope,
  psicologo: Stethoscope,
  productor_musical: Music,
  tatuador: Music,
  fotografo: Music,
};

function getProfessionIcon(slug: string): LucideIcon {
  return PROFESSION_ICONS[slug] || Scissors;
}

export default function BookingFlow({
  profile,
  profession,
  services,
  schedules,
  payments,
}: {
  profile: Profile;
  profession: Profession;
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
  const [direccion, setDireccion] = useState('');
  const [appointmentType, setAppointmentType] = useState<'in_person' | 'online' | 'home_service'>(
    profession.supports_online ? 'in_person' : 'in_person'
  );
  const [comprobante, setComprobante] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedId, setConfirmedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [busy, setBusy] = useState<Appointment[]>([]);
  const [blocked, setBlocked] = useState<BlockedSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const supabase = useMemo(() => createClient(), []);
  const service = services.find((s) => s.id === serviceId) || null;

  const slotConfig: SlotConfig = useMemo(
    () => professionToSlotConfig(profession),
    [profession]
  );

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
          .eq('profile_id', profile.id)
          .eq('fecha', key)
          .in('status', ['pending', 'confirmed']),
        supabase
          .from('blocked_slots')
          .select('*')
          .eq('profile_id', profile.id)
          .eq('fecha', key),
      ]);
      if (!active) return;
      setBusy((appts || []) as Appointment[]);
      setBlocked(blk || []);
      setLoadingSlots(false);
    })();
    return () => { active = false; };
  }, [date, profile.id, supabase]);

  const availableSlots = useMemo(() => {
    if (!date) return [];
    const dow = date.getDay();
    const daySchedules = schedules.filter((s) => s.dia_semana === dow);
    if (daySchedules.length === 0) return [];

    const slots: string[] = [];
    daySchedules.forEach((sch) => {
      const partial = generateSlotsByFlow(
        sch.hora_inicio.slice(0, 5),
        sch.hora_fin.slice(0, 5),
        slotConfig
      );
      partial.forEach((t) => { if (!slots.includes(t)) slots.push(t); });
    });
    slots.sort();

    const isToday = toDateKey(date) === toDateKey(new Date());
    const nowMin = isToday ? new Date().getHours() * 60 + new Date().getMinutes() : -1;

    const busyMins = new Set<number>();
    busy.forEach((a) => {
      const svc = services.find((s) => s.id === a.service_id);
      const dur = svc?.duration_min || slotConfig.interval;
      const start = timeToMinutes(a.hora.slice(0, 5));
      for (let m = start; m < start + dur; m += slotConfig.interval) busyMins.add(m);
    });

    blocked.forEach((b) => {
      const s = timeToMinutes(b.hora_inicio.slice(0, 5));
      const e = timeToMinutes(b.hora_fin.slice(0, 5));
      for (let m = s; m < e; m += slotConfig.interval) busyMins.add(m);
    });

    return slots.map((s) => {
      const m = timeToMinutes(s);
      const past = isToday && m <= nowMin;
      return { time: s, available: !busyMins.has(m) && !past };
    });
  }, [date, schedules, busy, blocked, services, slotConfig]);

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
      const path = `${profile.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('comprobantes')
        .upload(path, comprobante, { cacheControl: '3600', upsert: false });
      if (upErr) { setErrorMsg('Hubo un rollo al subir la foto de tu comprobante. Intenta otra vez.'); setSubmitting(false); return; }
      const { data } = supabase.storage.from('comprobantes').getPublicUrl(path);
      comprobante_url = data.publicUrl;
    }

    const { data: created, error } = await supabase
      .from('appointments')
      .insert({
        profile_id: profile.id,
        service_id: service.id,
        cliente_nombre: nombre.trim(),
        cliente_telefono: telefono.trim(),
        fecha: toDateKey(date),
        hora: time,
        status: 'pending',
        appointment_type: appointmentType,
        address: direccion.trim() || null,
        comprobante_url,
      })
      .select()
      .single();

    setSubmitting(false);
    if (error || !created) { setErrorMsg('No se pudo crear la reserva. Por favor, intenta de nuevo.'); return; }
    setConfirmedId(created.id);
    setStep(4);
  };

  const ProfessionIcon = getProfessionIcon(profession.slug);

  if (confirmedId) {
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center px-5 py-12 bg-[#FAF9F6] text-left">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#d2ff00]/20 border border-[#d2ff00]/40 shadow-sm">
          <Check className="h-10 w-10 text-neutral-900" />
        </div>
        <h1 className="text-[22px] font-extrabold text-neutral-900 text-center">¡Cita enviada!</h1>
        <p className="mt-3 max-w-sm text-center text-[14px] text-neutral-600 leading-relaxed">
          Tu reserva quedó en espera. **{profile.business_name}** la revisará y te confirmará de una.
        </p>

        <div className="mt-8 w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between py-2">
            <span className="text-[13px] text-neutral-400 font-bold uppercase tracking-wider">Fecha</span>
            <span className="text-[14px] font-bold text-neutral-900">{formatFechaLarga(date!)}</span>
          </div>
          <div className="my-2 h-px bg-neutral-100" />
          <div className="flex items-center justify-between py-2">
            <span className="text-[13px] text-neutral-400 font-bold uppercase tracking-wider">Hora</span>
            <span className="text-[14px] font-extrabold text-black bg-[#d2ff00] px-2 py-0.5 rounded border border-black/5">{formatHora12(time!)}</span>
          </div>
          <div className="my-2 h-px bg-neutral-100" />
          {service && (
            <>
              <div className="flex items-center justify-between py-2">
                <span className="text-[13px] text-neutral-400 font-bold uppercase tracking-wider">Servicio</span>
                <span className="text-[14px] font-bold text-neutral-900">{service.name}</span>
              </div>
            </>
          )}
        </div>

        <button onClick={() => { setStep(1); setDate(null); setTime(null); setNombre(''); setTelefono(''); setDireccion(''); setComprobante(null); setConfirmedId(null); }}
          className="mt-8 inline-flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-6 py-2.5 text-[14px] font-bold text-neutral-700 hover:text-black hover:bg-neutral-50 shadow-sm transition">
          Hacer otra reserva
        </button>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-white pb-32 text-left">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-neutral-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3 pt-[max(env(safe-area-inset-top),12px)]">
          <Link href="/" className="touch-target-sm -ml-1 flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:text-black hover:bg-neutral-100 transition">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          {profile.photo_url ? (
            <img src={profile.photo_url} alt={profile.business_name} className="h-9 w-9 rounded-full object-cover ring-1 ring-[#d2ff00]/40" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-[13px] font-extrabold text-neutral-600 border border-neutral-200">
              {profile.business_name.charAt(0)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-bold text-neutral-900">{profile.business_name}</p>
            <p className="text-[12px] text-neutral-400 font-bold uppercase tracking-wider">
              {profession.name} · {appointmentType === 'online' ? 'Online' : appointmentType === 'home_service' ? 'A domicilio' : 'Presencial'}
            </p>
          </div>
        </div>
        <StepIndicator step={step} />
      </header>

      <div className="mx-auto max-w-2xl px-4 pt-6">
        {profile.description && step === 1 && (
          <p className="mb-6 text-center text-[14px] text-neutral-600 leading-relaxed font-medium">{profile.description}</p>
        )}

        {/* PASO 1: Fecha y hora */}
        {step === 1 && (
          <>
            <h2 className="text-[20px] font-extrabold text-neutral-900">Elige qué día y hora</h2>
            <p className="mt-1 text-[14px] text-neutral-500">Selecciona cuándo te cuadra tu cita</p>

            {/* Selector de tipo de cita (solo si aplica) */}
            {profession.supports_online && (
              <div className="mt-4 flex gap-2">
                {(['in_person', 'online'] as const).map((type) => (
                  <button key={type} onClick={() => setAppointmentType(type)}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-bold transition border ${
                      appointmentType === type
                        ? 'bg-[#d2ff00] text-black border-black/10 shadow-sm'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 border-transparent'
                    }`}>
                    {type === 'online' ? <Video className="h-4 w-4" /> : <Home className="h-4 w-4" />}
                    {type === 'online' ? 'Online' : 'Presencial'}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-5 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <IOSCalendar
                value={date}
                onChange={(d) => { setDate(d); setTime(null); }}
                isDayAvailable={availableDayChecker}
              />
            </div>

            {date && (
              <div className="mt-6 animate-fade-up">
                <p className="flex items-center gap-2 text-[13px] font-bold text-neutral-500 mb-3">
                  <Clock className="h-4 w-4" /> Horarios libres — {formatFechaLarga(date)}
                </p>
                <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                  {loadingSlots ? (
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-11 animate-pulse rounded-xl bg-neutral-100" />
                      ))}
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <p className="text-center text-[14px] text-neutral-400 py-6">No hay horarios disponibles para este día</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {availableSlots.map((s) => (
                        <button key={s.time} disabled={!s.available} onClick={() => setTime(s.time)}
                          className={`touch-target-sm h-11 rounded-xl text-[14px] font-bold transition-all duration-150 ${
                            time === s.time
                              ? 'bg-[#d2ff00] text-black border border-black/10 shadow-sm'
                              : s.available
                              ? 'bg-neutral-50 text-neutral-800 hover:bg-neutral-100 border border-neutral-200'
                              : 'bg-neutral-50/50 text-neutral-300 line-through cursor-not-allowed border-transparent'
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
            <h2 className="text-[20px] font-extrabold text-neutral-900">Tus datos</h2>
            <p className="mt-1 text-[14px] text-neutral-500">Por favor, ingresa tus datos para ponernos en contacto</p>

            <div className="mt-5 rounded-2xl border border-neutral-200 bg-white p-5 space-y-4 shadow-sm">
              <div>
                <label className="text-[12px] font-bold text-neutral-500 mb-1.5 block">Tu nombre y apellido</label>
                <input type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Carlos Pérez" className="input" />
              </div>
              <div>
                <label className="text-[12px] font-bold text-neutral-500 mb-1.5 block">Teléfono o WhatsApp</label>
                <input type="tel" required value={telefono} onChange={(e) => setTelefono(e.target.value)}
                  placeholder="0412-1234567" className="input" />
              </div>
              {appointmentType === 'home_service' && (
                <div>
                  <label className="text-[12px] font-bold text-neutral-500 mb-1.5 block">Dirección del servicio</label>
                  <input type="text" required value={direccion} onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Ej: Urbanización, calle, casa #" className="input" />
                </div>
              )}
            </div>

            <h3 className="mt-8 text-[17px] font-bold text-neutral-900">¿Qué te vas a hacer?</h3>
            {services.length === 0 ? (
              <p className="mt-3 text-center text-[14px] text-neutral-400 py-6">Este profesional aún no tiene servicios montados.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {services.map((s) => (
                  <button key={s.id} onClick={() => setServiceId(s.id)}
                    className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-all duration-150 ${
                      serviceId === s.id
                        ? 'border-[#d2ff00] bg-[#d2ff00]/5 ring-1 ring-[#d2ff00]/30'
                        : 'border-neutral-200 bg-white hover:border-neutral-300 shadow-sm'
                    }`}>
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        serviceId === s.id ? 'bg-[#d2ff00]/25 text-black' : 'bg-neutral-100 text-neutral-400'
                      }`}>
                        <ProfessionIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[15px] font-bold text-neutral-900">{s.name}</p>
                        <p className="text-[12px] text-neutral-400 font-medium">{s.duration_min} min</p>
                      </div>
                    </div>
                    <span className="text-[17px] font-extrabold text-black bg-[#d2ff00]/20 px-2 py-0.5 rounded border border-[#d2ff00]/40">${s.price}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button onClick={() => setStep(1)}
                className="h-12 rounded-xl border border-neutral-300 bg-white text-[14px] font-bold text-neutral-600 hover:text-black hover:bg-neutral-50 transition shadow-sm">
                Atrás
              </button>
              <button onClick={() => setStep(3)} disabled={!nombre || !telefono || !service}
                className="btn-primary disabled:opacity-40 !h-12 !text-[15px] shadow-sm">
                Continuar
              </button>
            </div>
          </>
        )}

        {/* PASO 3: Pago */}
        {step === 3 && (
          <>
            <h2 className="text-[20px] font-extrabold text-neutral-900">Revisa los detalles y paga</h2>
            <p className="mt-1 text-[14px] text-neutral-500">Usa cualquiera de los métodos disponibles para transferir</p>

            <div className="mt-5 rounded-2xl border border-neutral-200 bg-white p-5 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-neutral-400 font-bold uppercase tracking-wider">Fecha</span>
                <span className="text-[15px] font-bold text-neutral-900">{formatFechaLarga(date!)}</span>
              </div>
              <div className="h-px bg-neutral-100" />
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-neutral-400 font-bold uppercase tracking-wider">Hora</span>
                <span className="text-[15px] font-extrabold text-black bg-[#d2ff00] px-2 py-0.5 rounded border border-black/5">{formatHora12(time!)}</span>
              </div>
              <div className="h-px bg-neutral-100" />
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-neutral-400 font-bold uppercase tracking-wider">Servicio</span>
                <span className="text-[15px] font-bold text-neutral-900">{service?.name}</span>
              </div>
              {appointmentType === 'home_service' && direccion && (
                <>
                  <div className="h-px bg-neutral-100" />
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-neutral-400 font-bold uppercase tracking-wider">Dirección</span>
                    <span className="text-[15px] font-bold text-neutral-900 text-right max-w-[200px] truncate">{direccion}</span>
                  </div>
                </>
              )}
              <div className="h-px bg-neutral-100" />
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-neutral-400 font-bold uppercase tracking-wider">Monto final</span>
                <span className="text-[22px] font-extrabold text-black bg-[#d2ff00]/30 px-3 py-0.5 rounded border border-[#d2ff00]/50">${service?.price}</span>
              </div>
            </div>

            <h3 className="mt-8 text-[17px] font-bold text-neutral-900">Cómo pagar</h3>
            {payments.length === 0 ? (
              <div className="mt-3 rounded-2xl border border-neutral-200 bg-white p-5 text-center text-[14px] text-neutral-400 shadow-sm font-medium">
                Este profesional aún no ha configurado métodos de pago. Comunícate directamente.
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                {payments.map((p) => <PaymentInfoCard key={p.id} method={p} />)}
              </div>
            )}

            <h3 className="mt-8 text-[17px] font-bold text-neutral-900">Sube tu captura de pago</h3>
            <p className="mt-1 text-[13px] text-neutral-400">El comprobante o captura de la transferencia (opcional)</p>
            <label className="mt-3 flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-neutral-300 bg-white p-4 hover:border-neutral-400 shadow-sm transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d2ff00]/20 text-black border border-[#d2ff00]/40">
                <Upload className="h-5 w-5" />
              </div>
              <span className="flex-1 truncate text-[14px] text-neutral-600 font-bold">
                {comprobante ? comprobante.name : 'Toca para subir la captura'}
              </span>
              <input type="file" accept="image/*,application/pdf" hidden onChange={(e) => setComprobante(e.target.files?.[0] || null)} />
            </label>

            {errorMsg && <p className="mt-4 text-center text-[14px] text-red-600 font-bold">{errorMsg}</p>}

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button onClick={() => setStep(2)}
                className="h-12 rounded-xl border border-neutral-300 bg-white text-[14px] font-bold text-neutral-600 hover:text-black hover:bg-neutral-50 transition shadow-sm">
                Atrás
              </button>
              <button onClick={submit} disabled={submitting}
                className="btn-primary disabled:opacity-40 !h-12 !text-[15px] shadow-sm">
                {submitting ? 'Enviando…' : 'Confirmar cita de una'}
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
      <div key={n} className={`h-1.5 flex-1 rounded-full transition-colors ${
        n <= step ? 'bg-[#d2ff00]' : 'bg-neutral-200'
      }`} />
    ))}
  </div>
);

const StickyCTA = ({ label, onClick, disabled, info }: {
  label: string; onClick: () => void; disabled?: boolean; info?: string;
}) => (
  <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-neutral-200 bg-white/90 backdrop-blur-xl px-4 pb-[max(env(safe-area-inset-bottom),16px)] pt-4">
    <div className="mx-auto flex max-w-2xl flex-col gap-2">
      {info && <p className="text-center text-[12px] text-neutral-500 font-bold">{info}</p>}
      <button onClick={onClick} disabled={disabled}
        className="btn-primary w-full disabled:opacity-40 !h-12 !text-[15px] shadow-md">
        {label}
      </button>
    </div>
  </div>
);
