'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, Check, X, ChevronDown, ChevronLeft, ChevronRight,
  LayoutDashboard, Calendar, Scissors, Smartphone, Link2,
  CreditCard, Star, ArrowRight, Sparkles, CheckCircle
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { slugify } from '@/lib/time';
import { IndustryProvider, useIndustry } from '@/contexts/IndustryContext';
import type { Industry, Profession } from '@/lib/types';

const ACCENT = '#d2ff00';

const TOUR_SLIDES = [
  {
    icon: LayoutDashboard,
    title: 'Panel de control fino',
    desc: 'Ve tus reservas del día, tus clientes frecuentes y las ganancias del mes. Todo en una sola pantalla sin enredos.',
    color: '#000000',
  },
  {
    icon: Calendar,
    title: 'Agenda al pelo',
    desc: 'Tus clientes ven cuándo estás libre y agendan solitos. Tú solo decides si apruebas o no. Olvídate del fastidio de WhatsApp.',
    color: '#10B981',
  },
  {
    icon: Scissors,
    title: 'Servicios a tu medida',
    desc: 'Configura tus cortes, consultas o clases con su precio y duración exacta. Quedará bien claro para tus clientes.',
    color: '#F59E0B',
  },
  {
    icon: CreditCard,
    title: 'Cobra al tiro y directo',
    desc: 'Pago Móvil, Binance, PayPal o efectivo. Tus datos bancarios aparecen al reservar. Qfino no te quita comisiones.',
    color: '#8B5CF6',
  },
  {
    icon: Link2,
    title: 'Tu propio enlace',
    desc: 'Tu enlace qfino.app/tunombre listo para ponerlo en tu perfil de Instagram. Tus clientes reservan en un toque.',
    color: '#06B6D4',
  },
  {
    icon: Smartphone,
    title: 'Aplicación en tu bolsillo',
    desc: 'Instala Qfino en tu teléfono directo desde la web. Maneja tus reservas estés donde estés, volando.',
    color: '#EC4899',
  },
];

interface BillingOption {
  months: number;
  total: number;
  badge?: string;
  popular?: boolean;
}

const PLANES = [
  {
    id: 'individual' as const,
    name: 'Plan Emprendedor',
    monthly: 10,
    desc: 'Para los que resuelven solos',
    features: [
      'Tu enlace personalizado (qfino.app/tunombre)',
      'Agenda interactiva en tiempo real',
      'Servicios ilimitados',
      'Pago Móvil, Binance, PayPal, Zelle',
      'Notificaciones de reservas al instante',
      'App móvil ligera gratis',
    ],
    billing: [
      { months: 1, total: 10 } as BillingOption,
      { months: 2, total: 15, badge: '50% 2do mes' } as BillingOption,
      { months: 6, total: 48, badge: '20% desc' } as BillingOption,
      { months: 12, total: 84, badge: '30% desc', popular: true } as BillingOption,
    ],
  },
  {
    id: 'business' as const,
    name: 'Plan Negocio',
    monthly: 30,
    desc: 'Para los que tienen su equipo armado',
    featured: true,
    features: [
      'Todo lo del Plan Emprendedor',
      'Enlaces individuales para cada profesional',
      'Panel de control general de tu negocio',
      'Horarios y servicios por profesional',
      'Estadísticas y reportes de ingresos',
      'Soporte prioritario por WhatsApp',
    ],
    billing: [
      { months: 1, total: 30 } as BillingOption,
      { months: 2, total: 45, badge: '50% 2do mes' } as BillingOption,
      { months: 6, total: 144, badge: '20% desc' } as BillingOption,
      { months: 12, total: 252, badge: '30% desc', popular: true } as BillingOption,
    ],
  },
];

export default function OnboardingForm({ defaultName, defaultPhoto }: { defaultName: string; defaultPhoto: string | null }) {
  return (
    <IndustryProvider>
      <OnboardingFormInner defaultName={defaultName} defaultPhoto={defaultPhoto} />
    </IndustryProvider>
  );
}

function OnboardingFormInner({ defaultName, defaultPhoto }: { defaultName: string; defaultPhoto: string | null }) {
  const router = useRouter();
  const { industries, professions, loading: catsLoading, getProfessionsByIndustry } = useIndustry();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [openIndustry, setOpenIndustry] = useState<string | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(null);
  const [selectedProfession, setSelectedProfession] = useState<Profession | null>(null);
  const [businessName, setBusinessName] = useState(defaultName);
  const [username, setUsername] = useState(slugify(defaultName));
  const [available, setAvailable] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tourSlide, setTourSlide] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<'individual' | 'business' | null>(null);
  const [billingMonths, setBillingMonths] = useState<number>(1);

  useEffect(() => {
    if (!username || username.length < 3) { setAvailable(null); return; }
    let cancelled = false;
    const t = setTimeout(async () => {
      const supabase = createClient();
      const { data } = await supabase.from('profiles').select('id').eq('username', username).maybeSingle();
      if (!cancelled) setAvailable(!data);
    }, 300);
    return () => { cancelled = true; clearTimeout(t); };
  }, [username]);

  const submit = async () => {
    setError(null);
    if (!selectedProfession) { setError('Selecciona tu profesión'); return; }
    if (!username || username.length < 3) { setError('Elige un usuario de al menos 3 caracteres'); return; }
    if (available === false) { setError('Ese usuario ya está en uso. Elige otro por favor.'); return; }

    setSubmitting(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError('Sesión inválida'); setSubmitting(false); return; }

    const { error: insertErr } = await supabase.from('profiles').insert({
      user_id: user.id,
      username,
      profession_id: selectedProfession.id,
      business_name: businessName,
      photo_url: defaultPhoto,
      description: '',
      subscription_status: 'inactive',
    });

    if (insertErr) { setError(insertErr.message); setSubmitting(false); return; }

    setStep(3);
    setSubmitting(false);
  };

  const handleFinishTutorial = useCallback(() => {
    setStep(4);
  }, []);

  const handleSelectPlan = useCallback((planId: 'individual' | 'business') => {
    setSelectedPlan(planId);
    setBillingMonths(1);
  }, []);

  const handleContinueToPayment = useCallback(() => {
    if (selectedPlan) {
      router.push(`/pagar?plan=${selectedPlan}&months=${billingMonths}`);
    }
  }, [selectedPlan, billingMonths, router]);

  const handleSkipToDashboard = useCallback(() => {
    router.replace('/dashboard');
    router.refresh();
  }, [router]);

  const nextSlide = useCallback(() => {
    if (tourSlide < TOUR_SLIDES.length - 1) {
      setTourSlide(s => s + 1);
    } else {
      handleFinishTutorial();
    }
  }, [tourSlide, handleFinishTutorial]);

  const prevSlide = useCallback(() => {
    if (tourSlide > 0) {
      setTourSlide(s => s - 1);
    }
  }, [tourSlide]);

  if (catsLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="space-y-5 text-left">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold border transition-all duration-300 ${
              step >= s
                ? 'bg-[#d2ff00] text-black border-black/10'
                : 'bg-neutral-100 text-neutral-400 border-transparent'
            }`}>
              {step > s ? <Check className="h-3.5 w-3.5 font-bold" /> : s}
            </div>
            {s < 4 && <div className={`h-0.5 w-6 transition-colors duration-300 ${step > s ? 'bg-[#d2ff00]' : 'bg-neutral-200'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Profesión */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key="step1">
          <h2 className="text-[18px] font-extrabold text-[#09090b]">¿En qué trabajas?</h2>
          <p className="mt-1 text-[14px] text-label-secondary">Selecciona tu rubro para configurar tu perfil de una vez</p>
          <div className="mt-4 space-y-2">
            {industries.map((ind) => {
              const industryProfessions = getProfessionsByIndustry(ind.id);
              if (industryProfessions.length === 0) return null;
              const isOpen = openIndustry === ind.id;
              return (
                <div key={ind.id} className="rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-sm">
                  <button
                    type="button"
                    onClick={() => setOpenIndustry(isOpen ? null : ind.id)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition hover:bg-neutral-50"
                  >
                    <span className="text-[14px] font-bold text-neutral-900">{ind.name}</span>
                    <span className="flex items-center gap-2">
                      <span className="text-[12px] text-neutral-400 font-bold">{industryProfessions.length}</span>
                      <ChevronDown className={`h-4 w-4 text-neutral-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </span>
                  </button>
                  {isOpen && (
                    <div className="border-t border-neutral-100 px-2 py-2 grid grid-cols-1 gap-0.5 bg-neutral-50/50">
                      {industryProfessions.map((prof) => (
                        <button
                          key={prof.id}
                          type="button"
                          onClick={() => {
                            setSelectedIndustry(ind);
                            setSelectedProfession(prof);
                            setStep(2);
                          }}
                          className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-[13px] font-bold text-neutral-600 hover:bg-[#d2ff00] hover:text-black transition text-left"
                        >
                          {prof.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Step 2: Nombre + username */}
      {step === 2 && selectedProfession && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key="step2">
          <div className="flex items-center gap-2 mb-4">
            <button type="button" onClick={() => setStep(1)} className="inline-flex h-9 items-center justify-center rounded-lg px-3 text-[13px] font-bold text-neutral-600 hover:bg-neutral-100 hover:text-black transition">
              ← Atrás
            </button>
            <span className="text-[12px] text-neutral-400 font-bold">{selectedIndustry?.name} / {selectedProfession.name}</span>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              {defaultPhoto ? (
                <img src={defaultPhoto} alt={businessName} className="h-14 w-14 shrink-0 rounded-full object-cover ring-1 ring-neutral-200" />
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#FAF9F6] text-xl font-bold text-neutral-500 border border-neutral-200">
                  {businessName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <label className="text-[12px] font-bold text-neutral-500 mb-1.5 block">Nombre de tu negocio o tuyo</label>
                <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Tu nombre o estudio" className="input" required />
              </div>
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <label className="text-[12px] font-bold text-neutral-500 mb-1.5 block">Tu enlace público</label>
            <div className="flex items-center gap-2 rounded-lg bg-neutral-50 px-3.5 py-2.5 border border-neutral-200 focus-within:border-neutral-400 transition-all">
              <span className="text-[13px] text-neutral-400 font-bold shrink-0">qfino.app/</span>
              <input type="text" value={username} onChange={(e) => setUsername(slugify(e.target.value))} placeholder="tunombre" className="flex-1 bg-transparent text-[14px] text-black font-semibold outline-none" required />
              {available === true && username.length >= 3 && <Check className="h-4 w-4 text-emerald-500 shrink-0 font-bold" />}
              {available === false && <X className="h-4 w-4 text-red-500 shrink-0 font-bold" />}
            </div>
            <p className="mt-2 text-[12px] text-neutral-500">Este enlace es el que vas a colocar en tu biografía de Instagram.</p>
          </div>

          {error && <p className="text-center text-[13px] text-red-500 mt-3 font-semibold">{error}</p>}

          <button type="button" onClick={submit} disabled={submitting || available === false} className="mt-5 inline-flex w-full h-11 items-center justify-center gap-2 rounded-xl bg-[#d2ff00] text-black text-[14px] font-bold border border-black/5 shadow-sm hover:brightness-105 disabled:opacity-40 transition-all duration-150">
            {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Creando…</> : 'Crear mi perfil'}
          </button>
        </motion.div>
      )}

      {/* Step 3: Tutorial tour */}
      {step === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="step3">
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold border border-[#d2ff00]/40 bg-[#d2ff00]/10 text-neutral-900">
              <Sparkles className="h-3.5 w-3.5 text-yellow-500" /> Descubre Qfino
            </span>
          </div>

          <div className="mt-6 relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm min-h-[320px] flex flex-col justify-between">
            <AnimatePresence mode="wait">
              {(() => {
                const slide = TOUR_SLIDES[tourSlide];
                const Icon = slide.icon;
                return (
                  <motion.div
                    key={tourSlide}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.35 }}
                    className="flex flex-col items-center text-center"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl mb-5" style={{ backgroundColor: `${slide.color}15`, border: `1px solid ${slide.color}30` }}>
                      <Icon className="h-8 w-8 text-neutral-900" />
                    </div>
                    <h3 className="text-[20px] font-extrabold text-[#09090b]">{slide.title}</h3>
                    <p className="mt-3 max-w-sm text-[14px] text-neutral-600 leading-relaxed">{slide.desc}</p>
                  </motion.div>
                );
              })()}
            </AnimatePresence>

            {/* Dots */}
            <div className="mt-6 flex items-center justify-center gap-1.5">
              {TOUR_SLIDES.map((_, i) => (
                <button key={i} onClick={() => setTourSlide(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === tourSlide ? 'w-6 bg-[#d2ff00]' : 'w-1.5 bg-neutral-200'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <button type="button" onClick={prevSlide} disabled={tourSlide === 0}
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-5 text-[13px] font-bold text-neutral-600 hover:bg-neutral-50 disabled:opacity-30 transition">
              <ChevronLeft className="h-4 w-4" /> Anterior
            </button>
            <button type="button" onClick={nextSlide}
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-[#d2ff00] text-black border border-black/5 px-5 text-[13px] font-bold hover:brightness-105 transition">
              {tourSlide < TOUR_SLIDES.length - 1 ? <>Siguiente <ChevronRight className="h-4 w-4" /></> : 'Ver planes'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 4: Planes */}
      {step === 4 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key="step4">
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold border border-[#d2ff00]/40 bg-[#d2ff00]/10 text-neutral-900">
              <Star className="h-3 w-3 fill-current text-yellow-500" /> Elige tu plan
            </span>
            <h2 className="mt-3 text-[22px] font-extrabold text-[#09090b]">Tu negocio merece lo más fino</h2>
            <p className="mt-1 text-[14px] text-label-secondary">Pruébalo gratis por 7 días. Cancela cuando quieras, sin rollos.</p>
          </div>

          <div className="mt-6 space-y-4">
            {PLANES.map((p) => {
              const selected = selectedPlan === p.id;
              const billOpts = p.billing;
              return (
                <div key={p.id} className={`relative rounded-2xl p-5 text-left transition-all duration-200 bg-white ${
                  selected ? 'border-2 border-[#d2ff00] shadow-md' : 'border border-neutral-200 hover:shadow-sm'
                }`}>
                  {p.featured && (
                    <div className="absolute -top-2.5 right-4 inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-[9px] font-bold text-black shadow-sm" style={{ backgroundColor: ACCENT }}>
                      <Star className="h-3 w-3 fill-current" /> La más fina
                    </div>
                  )}
                  <button type="button" onClick={() => handleSelectPlan(p.id)} className="w-full text-left">
                    <div className="flex items-baseline gap-1">
                      <span className="text-[13px] text-neutral-400 font-bold">$</span>
                      <span className="text-[clamp(1.8rem,4vw,2.2rem)] font-extrabold text-neutral-900">{p.monthly}</span>
                      <span className="text-[13px] text-neutral-400 font-bold">/mes</span>
                    </div>
                    <h3 className="mt-1 text-[16px] font-extrabold text-neutral-950">{p.name}</h3>
                    <p className="text-[13px] text-neutral-500 leading-normal">{p.desc}</p>
                  </button>

                  {selected && (
                    <div className="mt-4">
                      <p className="text-[12px] font-bold text-neutral-500 mb-2">Paga mensual o ahorra un cerro de plata pagando anual:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {billOpts.map((b) => {
                          const isSelected = billingMonths === b.months;
                          const perMonth = (b.total / b.months).toFixed(0);
                          return (
                            <button
                              key={b.months}
                              type="button"
                              onClick={() => setBillingMonths(b.months)}
                              className={`relative rounded-xl p-3 text-left transition-all border ${
                                isSelected ? 'border-[#d2ff00] bg-[#d2ff00]/5' : 'border-neutral-200 bg-white hover:border-[#d2ff00]/40'
                              }`}
                            >
                              {b.badge && (
                                <span className="absolute -top-1.5 -right-1.5 inline-flex items-center rounded-full bg-black px-1.5 py-0.5 text-[8px] font-bold text-[#d2ff00] shadow-sm">
                                  {b.badge}
                                </span>
                              )}
                              {b.popular && (
                                <span className="absolute -top-1.5 -left-1.5 inline-flex items-center rounded-full bg-emerald-500 px-1.5 py-0.5 text-[8px] font-bold text-white shadow-sm">
                                  Mejor oferta
                                </span>
                              )}
                              <p className="text-[13px] font-extrabold text-neutral-900">${b.total}</p>
                              <p className="text-[9px] text-neutral-400 font-bold">${perMonth}/mes · {b.months} {b.months === 1 ? 'mes' : 'meses'}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <button type="button" onClick={handleContinueToPayment} disabled={!selectedPlan}
              className="inline-flex w-full h-12 items-center justify-center gap-2 rounded-xl bg-[#d2ff00] text-black text-[15px] font-bold shadow-sm hover:brightness-105 disabled:opacity-40 border border-black/5 transition-all duration-150">
              {selectedPlan
                ? `Activar plan de una — $${PLANES.find(p => p.id === selectedPlan)?.billing.find(b => b.months === billingMonths)?.total}`
                : 'Selecciona un plan'}
              <ArrowRight className="h-4 w-4 text-black" />
            </button>
            <button type="button" onClick={handleSkipToDashboard}
              className="inline-flex w-full h-11 items-center justify-center gap-1.5 rounded-xl border border-neutral-200 text-[13px] font-bold text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 transition">
              Ir al panel de control — decido después
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
