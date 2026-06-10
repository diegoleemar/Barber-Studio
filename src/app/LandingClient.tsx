'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, ChevronDown, Calendar, Scissors, Smartphone, Globe, Shield, Star, Quote, Clock, Sparkles } from 'lucide-react';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import PWAInstallButton from '@/components/ui/PWAInstallButton';

/* ─── Section Header ─── */
const SectionHeader = ({ badge, title, desc }: { badge: string | ReactNode; title: string; desc?: string }) => (
  <div className="text-center mb-14 md:mb-16">
    <span className="inline-flex items-center gap-1.5 rounded-md border border-[#222] bg-[rgba(13,13,13,0.8)] px-3.5 py-1.5 text-[12px] font-medium text-label-secondary">
      {badge}
    </span>
    <h2 className="mt-5 text-display text-[clamp(1.8rem,3.5vw,3rem)] max-w-3xl mx-auto leading-[1.1]">{title}</h2>
    {desc && <p className="mt-4 text-[15px] md:text-[17px] text-label-secondary max-w-2xl mx-auto leading-relaxed">{desc}</p>}
  </div>
);

/* ─── Feature Tags ─── */
const Tags = ({ items }: { items: string[] }) => (
  <div className="flex flex-wrap gap-2 mt-6">
    {items.map((t) => (
      <span key={t} className="inline-flex items-center rounded-md border border-[#222] bg-black px-3 py-1 text-[12px] font-medium text-label-secondary">
        {t}
      </span>
    ))}
  </div>
);

export default function LandingClient() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="bg-black text-white overflow-x-hidden">
      {/* ─── NAV ─── */}
      <nav className={`fixed left-0 right-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? 'border-b border-[#222] bg-black/80 backdrop-blur-xl' : 'bg-transparent'
      }`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Barber Studio" className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg object-contain" />
            <span className="text-[15px] sm:text-[17px] font-semibold tracking-tight">Barber Studio</span>
          </Link>
          <div className="hidden items-center gap-1 md:flex">
            <a href="#features" className="btn-ghost !text-[14px]">Funciones</a>
            <a href="#como-funciona" className="btn-ghost !text-[14px]">Cómo funciona</a>
            <a href="#faq" className="btn-ghost !text-[14px]">FAQ</a>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className="hidden sm:inline-flex btn-ghost !h-[38px] !px-4 !text-[13px]">Iniciar sesión</Link>
            <Link href="/login" className="inline-flex h-[44px] sm:h-[38px] items-center justify-center gap-2 rounded-lg bg-brand px-4 sm:px-5 text-[13px] font-semibold text-white shadow-sm transition-all duration-200 hover:brightness-110 active:scale-[0.97] min-w-[44px]">
              {scrolled ? 'Comenzar' : 'Comenzar'}
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <HeroSection />
        <LogoBarSection />
        <FeaturesSection />
        <PricingSection />
        <ComoFunciona />
        <TestimoniosSection />
        <CTASection />
        <FaqSection />
      </main>

      <footer className="border-t border-[#222] px-4 sm:px-6 py-10 sm:py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 sm:gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Barber Studio" className="h-6 w-6 sm:h-7 sm:w-7 rounded-md object-contain" />
            <span className="text-[13px] sm:text-[14px] font-semibold">Barber Studio</span>
          </div>
          <p className="text-[12px] sm:text-[13px] text-label-tertiary text-center sm:text-left">Hecho para los barberos de Venezuela · Planes desde $10/mes</p>
          <div className="flex gap-4 text-[12px] sm:text-[13px] text-label-tertiary">
            <a href="https://supabase.com" target="_blank" rel="noreferrer" className="transition hover:text-brand">Supabase</a>
            <a href="https://vercel.com" target="_blank" rel="noreferrer" className="transition hover:text-brand">Vercel</a>
          </div>
        </div>
      </footer>

      <PWAInstallButton />
    </div>
  );
}

/* ─── HERO ─── */
const HeroSection = () => (
  <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-brand/10 blur-[200px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-brand/5 blur-[180px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-brand/[0.03] blur-[250px]" />
      <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
    </div>
    <div className="relative mx-auto w-full max-w-5xl px-4 sm:px-6 pt-28 pb-16 sm:pt-36 sm:pb-24 text-center">

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <span className="inline-flex items-center gap-1.5 rounded-md border border-[#222] bg-[rgba(13,13,13,0.8)] px-3 py-1 sm:px-3.5 sm:py-1.5 text-[11px] sm:text-[12px] font-medium text-brand">
          <Sparkles className="h-3 w-3" /> Para barberos en Venezuela
        </span>
      </motion.div>

      <h1 className="mt-6 sm:mt-8 text-[clamp(2rem,7vw,5.5rem)] font-bold tracking-[-0.03em] sm:tracking-[-0.04em] leading-[1.05] max-w-4xl mx-auto">
        {['Tu', 'barbería,', 'siempre', 'llena'].map((word, i) => (
          <span key={i} style={{
            display: 'inline-block',
            opacity: 0.001,
            filter: 'blur(12px)',
            transform: 'translateY(20px)',
            animation: `fadeWord 0.7s ease-out ${0.3 + i * 0.12}s forwards`,
            color: word === 'llena' ? '#06B6D4' : 'white'
          }}>{word}{' '}</span>
        ))}
        <style>{`@keyframes fadeWord{to{opacity:1;filter:blur(0);transform:translateY(0)}}`}</style>
      </h1>

      <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.8 }}
        className="mt-6 max-w-2xl mx-auto text-[clamp(1rem,1.8vw,1.25rem)] leading-relaxed text-label-secondary">
        Tus clientes reservan en línea. Tú solo te concentras en cortar. Planes desde <span className="text-brand font-medium">$10/mes</span>.
      </motion.p>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.95 }}
        className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
        <GoogleSignInButton label="Empieza prueba gratis" className="!h-[52px] w-full sm:w-auto !rounded-xl !text-[15px] !font-semibold !shadow-glow-lg sm:!px-8" />
        <Link href="#features" className="inline-flex h-[52px] w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-[#222] bg-[rgba(13,13,13,0.8)] px-8 text-[15px] font-medium text-label-primary transition-all duration-200 hover:bg-white/5 active:scale-[0.97]">
          Ver funciones <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 1.1 }}
        className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[12px] sm:text-[13px] text-label-tertiary">
        <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-brand" /> Prueba 7 días gratis</span>
        <span className="hidden sm:inline w-1 h-1 rounded-full bg-label-quaternary" />
        <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-brand" /> Sin tarjeta</span>
        <span className="hidden sm:inline w-1 h-1 rounded-full bg-label-quaternary" />
        <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-brand" /> 1 minuto</span>
      </motion.div>
    </div>
  </section>
);

/* ─── LOGO BAR (inspired by Xtract) ─── */
const LogoBarSection = () => (
  <section className="py-12 sm:py-16 border-y border-[#222]">
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <p className="text-center text-[11px] sm:text-[12px] font-medium text-label-tertiary uppercase tracking-widest mb-6 sm:mb-8">Usado por barberos en todo Venezuela</p>
      <div className="flex items-center justify-start sm:justify-center gap-8 sm:gap-10 md:gap-16 opacity-40 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        {['Caracas', 'Maracaibo', 'Valencia', 'Barquisimeto', 'Maracay', 'Ciudad Guayana'].map((city) => (
          <div key={city} className="text-[13px] sm:text-[14px] font-semibold text-label-secondary tracking-tight whitespace-nowrap shrink-0">{city}</div>
        ))}
      </div>
    </div>
  </section>
);

/* ─── FEATURES (Alternative layout from Xtract) ─── */
const FeaturesSection = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.1 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} id="features" className="section-full relative overflow-hidden">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeader badge="Funciones" title="Todo lo que necesitas para gestionar tu barbería" desc="Planes desde $10/mes para impulsar tu negocio." />

        {/* Feature 1: Agenda visual mockup left, content right */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={visible ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}
          className="grid md:grid-cols-2 gap-8 md:gap-16 items-center mb-24 md:mb-32">
          <div className="order-2 md:order-1">
            <div className="rounded-2xl border border-[#222] bg-black overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#222] bg-[rgba(255,255,255,0.02)]">
                <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500/50" /><div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" /><div className="w-2.5 h-2.5 rounded-full bg-green-500/50" /></div>
                <span className="text-[11px] text-label-quaternary ml-2">Agenda en tiempo real</span>
              </div>
              <div className="p-5 space-y-3">
                {[
                  { time: '9:00 AM', client: 'Carlos Méndez', service: 'Corte clásico', status: 'Confirmada' },
                  { time: '10:30 AM', client: 'José Perdomo', service: 'Corte + barba', status: 'Pendiente' },
                  { time: '2:00 PM', client: 'Luis Rivas', service: 'Corte degradado', status: 'Confirmada' },
                  { time: '4:00 PM', client: 'Andrés Torres', service: 'Corte infantil', status: 'Pendiente' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg border border-[#222] bg-[rgba(255,255,255,0.02)]">
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-label-quaternary" />
                      <div><p className="text-[13px] font-medium">{item.time}</p><p className="text-[12px] text-label-tertiary">{item.client}</p></div>
                    </div>
                    <div className="text-right"><p className="text-[12px] text-label-secondary">{item.service}</p><p className={`text-[11px] font-medium ${item.status === 'Confirmada' ? 'text-emerald-400' : 'text-amber-400'}`}>{item.status}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-[#222] bg-[rgba(13,13,13,0.8)] px-3 py-1 text-[11px] font-medium text-brand">Reservas</span>
            <h3 className="mt-4 text-[clamp(1.5rem,2.5vw,2.2rem)] font-semibold tracking-tight leading-[1.15]">Agenda en tiempo real</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-label-secondary">Las reservas aparecen al instante. Confirmas o rechazas con un clic. Tus clientes ven tu disponibilidad y reservan solos desde su teléfono.</p>
            <Tags items={['Reservas ilimitadas', 'Notificaciones', 'Confirmación rápida']} />
          </div>
        </motion.div>

        {/* Feature 2: Content left, dashboard visual right */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={visible ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.15 }}
          className="grid md:grid-cols-2 gap-8 md:gap-16 items-center mb-24 md:mb-32">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-[#222] bg-[rgba(13,13,13,0.8)] px-3 py-1 text-[11px] font-medium text-brand">Gestión</span>
            <h3 className="mt-4 text-[clamp(1.5rem,2.5vw,2.2rem)] font-semibold tracking-tight leading-[1.15]">Dashboard completo</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-label-secondary">Servicios, horarios, perfil y clientes. Todo desde un solo lugar. Configura todo en minutos y olvídate del papeleo.</p>
            <Tags items={['Servicios ilimitados', 'Horarios flexibles', 'Perfil profesional']} />
          </div>
          <div>
            <div className="rounded-2xl border border-[#222] bg-black overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#222] bg-[rgba(255,255,255,0.02)]">
                <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500/50" /><div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" /><div className="w-2.5 h-2.5 rounded-full bg-green-500/50" /></div>
                <span className="text-[11px] text-label-quaternary ml-2">Dashboard</span>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Servicios', value: '8' },
                    { label: 'Clientes', value: '47' },
                    { label: 'Hoy', value: '6 citas' },
                  ].map((s, i) => (
                    <div key={i} className="text-center py-3 rounded-lg border border-[#222] bg-[rgba(255,255,255,0.02)]">
                      <p className="text-[18px] font-semibold text-brand">{s.value}</p>
                      <p className="text-[11px] text-label-tertiary">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {['Corte clásico - $15', 'Corte + barba - $22', 'Corte degradado - $18', 'Barba - $10'].map((s, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 px-3 rounded-lg border border-[#222] bg-[rgba(255,255,255,0.02)]">
                      <span className="text-[12px] text-label-secondary">{s.split(' - ')[0]}</span>
                      <span className="text-[12px] font-medium">{s.split(' - ')[1]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Feature 3: Payments visual left, content right */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={visible ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.3 }}
          className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
          <div className="order-2 md:order-1">
            <div className="rounded-2xl border border-[#222] bg-black overflow-hidden p-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 px-3 rounded-lg border border-[#222] bg-[rgba(255,255,255,0.02)]">
                  <div className="flex items-center gap-3"><Smartphone className="h-4 w-4 text-brand" /><span className="text-[13px]">Pago Móvil</span></div>
                  <span className="text-[11px] text-label-tertiary">Banesco · 0412-1234567</span>
                </div>
                <div className="flex items-center justify-between py-2 px-3 rounded-lg border border-[#222] bg-[rgba(255,255,255,0.02)]">
                  <div className="flex items-center gap-3"><Globe className="h-4 w-4 text-brand" /><span className="text-[13px]">Transferencia</span></div>
                  <span className="text-[11px] text-label-tertiary">0102-xxxx-xx-xxxx</span>
                </div>
                <div className="flex items-center justify-between py-2 px-3 rounded-lg border border-[#222] bg-[rgba(255,255,255,0.02)]">
                  <div className="flex items-center gap-3"><Shield className="h-4 w-4 text-brand" /><span className="text-[13px]">Efectivo</span></div>
                  <span className="text-[11px] text-label-tertiary">USD / BS al llegar</span>
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-[#222] bg-[rgba(13,13,13,0.8)] px-3 py-1 text-[11px] font-medium text-brand">Pagos</span>
            <h3 className="mt-4 text-[clamp(1.5rem,2.5vw,2.2rem)] font-semibold tracking-tight leading-[1.15]">Pago Móvil & Transferencia</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-label-secondary">Tus datos bancarios visibles al reservar. Cobras directo a tu cuenta, sin comisiones ni gateways. Pago Móvil, transferencia o efectivo.</p>
            <Tags items={['Sin comisiones', 'Pago Móvil VE', 'Efectivo USD/BS']} />
          </div>
        </motion.div>

        {/* Feature 4: App Móvil - installable PWA */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={visible ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.45 }}
          className="grid md:grid-cols-2 gap-8 md:gap-16 items-center mt-24 md:mt-32">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-[#222] bg-[rgba(13,13,13,0.8)] px-3 py-1 text-[11px] font-medium text-brand">App</span>
            <h3 className="mt-4 text-[clamp(1.5rem,2.5vw,2.2rem)] font-semibold tracking-tight leading-[1.15]">App móvil gratuita</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-label-secondary">Descarga la app gratis desde la web y llévala siempre en tu bolsillo. Sin necesidad de App Store ni Google Play — se instala directo en tu teléfono como cualquier app normal.</p>
            <Tags items={['Gratis • sin tiendas', 'Offline', 'Misma cuenta web']} />
          </div>
          <div>
            <div className="rounded-2xl border border-[#222] bg-black overflow-hidden p-6 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-brand shadow-glow-lg">
                <Smartphone className="h-10 w-10 text-white" />
              </div>
              <h4 className="mt-5 text-[18px] font-semibold">Barber Studio App</h4>
              <p className="mt-2 text-[13px] text-label-tertiary max-w-sm mx-auto">Instálala gratis desde esta página. Ve tu agenda, confirma citas y administra todo desde tu móvil.</p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <span className="inline-flex items-center gap-1.5 text-[12px] text-label-tertiary"><Check className="h-3.5 w-3.5 text-emerald-400" /> Agenda</span>
                <span className="inline-flex items-center gap-1.5 text-[12px] text-label-tertiary"><Check className="h-3.5 w-3.5 text-emerald-400" /> Servicios</span>
                <span className="inline-flex items-center gap-1.5 text-[12px] text-label-tertiary"><Check className="h-3.5 w-3.5 text-emerald-400" /> Perfil</span>
                <span className="inline-flex items-center gap-1.5 text-[12px] text-label-tertiary"><Check className="h-3.5 w-3.5 text-emerald-400" /> Pagos</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

/* ─── PRICING ─── */
const PricingSection = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.2 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  const plans = [
    {
      name: 'Barbero', price: '10', desc: 'Para barberos independientes',
      features: ['Perfil profesional personalizado', 'Agenda en tiempo real', 'Link personalizado barberstudio.app/tunombre', 'Servicios y precios ilimitados', 'Horarios editables', 'Pago Móvil, transferencia y efectivo', 'Notificaciones de reserva', '7 días de prueba gratis'],
      cta: 'Empezar prueba gratis', featured: true
    },
    {
      name: 'Barbería', price: '30', desc: 'Para barberías con 3+ barberos',
      features: ['Todo lo del plan Barbero', 'Links personalizados para cada barbero', 'Dashboard general de la barbería', 'Ajuste de % de ganancia por barbero', 'Horarios editables por cada barbero', 'Gestión de múltiples servicios', 'Estadísticas y reportes', 'Soporte prioritario'],
      cta: 'Empezar prueba gratis', featured: false
    }
  ];

  return (
    <section ref={ref} id="planes" className="section-full relative overflow-hidden border-y border-[#222]">
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
        <SectionHeader badge="Planes" title="Elige tu plan" desc="Paga solo lo que necesitas. Cancela cuando quieras." />

        <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
          {plans.map((p, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={visible ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.1 * i }}
              className={`relative rounded-2xl p-5 sm:p-8 transition-all duration-300 ${
                p.featured
                  ? 'bg-gradient-to-b from-brand/[0.03] to-black ring-2 ring-brand/40 shadow-glow-lg'
                  : 'bg-black ring-1 ring-[#222] hover:ring-brand/30'
              }`}>
              {p.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-brand px-4 py-1 text-[11px] font-semibold text-white uppercase tracking-wider shadow-glow">
                  <Star className="h-3 w-3" /> Más popular
                </div>
              )}
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-[15px] font-medium text-label-secondary">$</span>
                <span className="text-[clamp(2.5rem,5vw,3.5rem)] font-bold tracking-tight text-white">{p.price}</span>
                <span className="text-[15px] text-label-tertiary">/mes</span>
              </div>
              <h3 className="mt-4 text-[20px] font-semibold">{p.name}</h3>
              <p className="mt-1 text-[14px] text-label-secondary">{p.desc}</p>
              <ul className="mt-6 space-y-3">
                {p.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-3 text-[14px] text-label-secondary">
                    <Check className="h-4 w-4 text-brand shrink-0 mt-0.5" /><span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/login"
                className={`mt-8 flex h-12 w-full items-center justify-center rounded-xl text-[15px] font-semibold transition-all duration-200 ${
                  p.featured
                    ? 'bg-brand text-white shadow-glow hover:brightness-110 hover:shadow-glow-lg'
                    : 'bg-[rgba(13,13,13,0.8)] text-label-primary ring-1 ring-[#222] hover:bg-white/5'
                }`}>{p.cta}</Link>
            </motion.div>
          ))}
        </div>

        <motion.p initial={{ opacity: 0 }} animate={visible ? { opacity: 1 } : {}} className="mt-8 text-center text-[13px] text-label-tertiary">
          7 días de prueba gratis · Sin tarjeta · Cancela cuando quieras
        </motion.p>
      </div>
    </section>
  );
};

/* ─── CÓMO FUNCIONA ─── */
const STEPS = [
  { title: 'Conecta tu Google', desc: 'Vincula tu cuenta. En 30 segundos tienes tu perfil listo.', icon: Smartphone },
  { title: 'Configura tu barbería', desc: 'Añade servicios, precios y horarios con bloques flexibles.', icon: Scissors },
  { title: 'Comparte y recibe', desc: 'Tu enlace está listo. Los clientes reservan solos.', icon: Globe },
];

const ComoFunciona = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.2 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} id="como-funciona" className="section-full relative overflow-hidden">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeader badge="3 pasos" title="Empieza en 2 minutos" />

        <div className="grid md:grid-cols-3 gap-8 md:gap-16 relative">
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-brand/20 to-transparent" />
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} animate={visible ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.2 * i }}
                className="flex flex-col items-center text-center relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand/20 to-brand/5 ring-1 ring-brand/20 relative">
                  <Icon className="h-8 w-8 text-brand" />
                  <div className="absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-brand text-white text-[13px] font-bold shadow-glow">{i + 1}</div>
                </div>
                <h3 className="mt-6 text-[19px] font-semibold">{s.title}</h3>
                <p className="mt-2 max-w-xs text-[14px] leading-relaxed text-label-secondary">{s.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

/* ─── TESTIMONIOS ─── */
const TESTIMONIALS = [
  { name: 'Carlos Ramírez', role: 'Barbería El Padrino, Caracas', text: 'Desde que uso Barber Studio, mi agenda nunca está vacía. Los clientes reservan solos.', rating: 5 },
  { name: 'José Martínez', role: 'Studio 45, Maracaibo', text: 'Desde que uso Barber Studio, mis clientes reservan solos sin llamar. Me cambió la forma de trabajar.', rating: 5 },
  { name: 'Luis Fernández', role: 'Barba & Corte, Valencia', text: 'Tener todo en un solo lugar me ahorra horas a la semana. Mis clientes pagan directo como siempre.', rating: 5 },
];

const TestimoniosSection = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.2 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="section-full relative overflow-hidden border-y border-[#222]">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeader badge={<><Quote className="h-3 w-3" /> Testimonios</>} title="Lo que dicen los barberos" />
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={visible ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.1 * i }}
              className="rounded-2xl border border-[#222] bg-black p-6 flex flex-col justify-between">
              <div>
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => <Star key={j} className="h-4 w-4 fill-brand text-brand" />)}
                </div>
                <p className="text-[14px] leading-relaxed text-label-secondary italic">&ldquo;{t.text}&rdquo;</p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#222]">
                <p className="text-[14px] font-semibold">{t.name}</p>
                <p className="text-[12px] text-label-tertiary">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─── CTA ─── */
const CTASection = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.3 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="section-full relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-brand/[0.04] blur-[200px]" />
      </div>
      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <div className="mx-auto mb-6 sm:mb-8 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl sm:rounded-3xl border border-[#222] bg-[rgba(13,13,13,0.8)]">
          <img src="/logo.png" alt="" className="h-8 w-8 sm:h-10 sm:w-10 object-contain" />
        </div>
        <h2 className="text-display text-[clamp(1.6rem,4vw,3.5rem)]">¿Listo para llenar tu agenda?</h2>
        <p className="mx-auto mt-3 sm:mt-4 max-w-md text-[14px] sm:text-[16px] text-label-secondary">Prueba gratis 7 días. Sin compromiso.</p>
        <div className="mt-8 sm:mt-10 flex flex-col items-center gap-3 sm:gap-4">
          <GoogleSignInButton label="Empezar prueba gratis" className="!h-[52px] w-full sm:w-auto !rounded-xl !text-[15px] sm:!text-[17px] !font-semibold !shadow-glow-lg sm:!px-10 animate-glow-pulse" />
          <p className="text-[12px] sm:text-[13px] text-label-tertiary">Sin instalaciones · Sin tarjeta · 1 minuto</p>
        </div>
        <div className="mt-12 sm:mt-16 flex flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-16">
          {[
            { label: 'Prueba 7 días', desc: 'Sin tarjeta' },
            { label: 'Cancela cuando quieras', desc: 'Sin multas' },
            { label: 'Soporte directo', desc: 'Respuesta rápida' },
          ].map(({ label, desc }) => (
            <div key={label} className="text-center">
              <p className="text-[15px] font-semibold">{label}</p>
              <p className="text-[12px] text-label-tertiary">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─── FAQ ─── */
const FAQS = [
  { q: '¿Qué necesito para empezar?', a: 'Solo una cuenta de Google. En menos de un minuto tienes tu perfil listo.' },
  { q: '¿Cuánto cuesta?', a: 'El plan Barbero cuesta $10/mes y el plan Barbería $30/mes. Ambos incluyen 7 días de prueba gratis sin tarjeta.' },
  { q: '¿Cómo recibo los pagos?', a: 'No procesamos pagos. Tus clientes ven tus datos de Pago Móvil o transferencia al reservar.' },
  { q: '¿Puedo tener horarios con descanso?', a: 'Sí. Divide tu día en múltiples bloques: mañana, tarde y noche.' },
  { q: '¿Qué es el plan Barbería?', a: 'Para barberías con 3 o más barberos. Cada barbero tiene su link personalizado y tú ajustas el % de ganancia de cada uno.' },
  { q: '¿Puedo cambiar mi username?', a: 'No se puede modificar después de crear el perfil. Elígelo bien al registrarte.' },
];

const FaqSection = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.1 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} id="faq" className="section-full">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeader badge="FAQ" title="Preguntas frecuentes" />
        <div className="space-y-2 sm:space-y-3">
          {FAQS.map(({ q, a }, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={visible ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.05 * i }}
              className="rounded-2xl border border-[#222] bg-black overflow-hidden">
              <button onClick={() => setOpen(open === i ? null : i)}
                className="touch-target flex w-full items-center justify-between gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5 text-left text-[14px] sm:text-[15px] font-medium transition hover:text-brand">
                <span>{q}</span>
                <ChevronDown className={`h-4 w-4 shrink-0 text-label-tertiary transition-transform duration-300 ${open === i ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <p className="px-4 sm:px-6 pb-4 sm:pb-6 text-[13px] sm:text-[14px] leading-relaxed text-label-secondary">{a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
