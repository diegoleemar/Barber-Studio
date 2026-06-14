'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

import {
  ArrowRight, Check, ChevronDown, Menu, X, Star, Quote,
  Clock, Sparkles, Users, Scissors, HeartPulse, Palette,
  Dumbbell, Wrench, Briefcase, Bell, Calendar, Link2,
  HelpCircle, ChevronRight, CheckCircle, Smartphone,
  Globe, Zap
} from 'lucide-react';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';

/* ─── Constants ─── */
const ORANGE = '#f94b25';
const LIME = '#a3e635';
const CREAM = '#fafaf9';

/* ─── Animation Variants ─── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }
});

const fadeUpCard = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }
});

/* ─── Section Eyebrow ─── */
const Eyebrow = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <p className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[12px] font-bold tracking-wide ${className}`}>
    <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" />
    {children}
  </p>
);

/* ─── Section Header ─── */
const SectionHeader = ({ eyebrow, title, intro }: { eyebrow: string | ReactNode; title: string; intro?: string }) => (
  <div className="text-center mb-12 md:mb-16 flex flex-col items-center">
    <Eyebrow className="bg-white/80 border border-[rgba(0,0,0,0.06)] text-label-secondary shadow-sm">{eyebrow}</Eyebrow>
    <h2 className="mt-5 text-[clamp(1.8rem,4vw,3rem)] font-extrabold tracking-tighter max-w-3xl leading-[1.1] text-label-primary">{title}</h2>
    {intro && <p className="mt-4 text-[15px] md:text-[17px] text-label-secondary max-w-2xl leading-relaxed">{intro}</p>}
  </div>
);

/* ─── Bouncy Number ─── */
const CountUp = ({ value, suffix = '' }: { value: number; suffix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.5 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = Math.ceil(value / 30);
    const interval = setInterval(() => {
      start += step;
      if (start >= value) { setCount(value); clearInterval(interval); return; }
      setCount(start);
    }, 40);
    return () => clearInterval(interval);
  }, [visible, value]);

  return <span ref={ref}>{count}{suffix}</span>;
};

/* ─────────────────────────────────────────────── */
/*  HERO SECTION                                  */
/* ─────────────────────────────────────────────── */
const HeroSection = () => {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#fafaf9]" id="inicio">
      {/* Backdrop */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-glow-orange blur-[120px]" />
        <div className="absolute -left-[10%] top-[20%] w-[300px] h-[300px] rounded-full bg-[rgba(249,75,37,0.03)] blur-[80px]" />
        <div className="absolute right-[5%] top-[40%] w-[200px] h-[200px] rounded-full bg-[rgba(163,230,53,0.04)] blur-[60px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        {/* ─── Nav ─── */}
        <HeroNav />

        {/* ─── Hero Panel ─── */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 pt-28 md:pt-36 pb-16 md:pb-24 items-center">
          {/* Copy Column */}
          <div className="text-left max-w-xl">
            <motion.div {...fadeUp(0)}>
              <Eyebrow className="bg-white border border-[rgba(0,0,0,0.06)] text-label-secondary shadow-sm mb-6">
                Hecha para negocios por cita
              </Eyebrow>
            </motion.div>

            <motion.h1 {...fadeUp(0.1)} className="text-[clamp(2.5rem,5.5vw,4rem)] font-extrabold tracking-tighter leading-[1.05] text-label-primary">
              Automatiza{' '}
              <span className="relative inline-block">
                <span className="absolute inset-0 bg-brand/10 -skew-x-3 rounded-sm" />
                tu agenda,
              </span>
              <br className="hidden lg:block" />
              tu equipo y tus cobros.
            </motion.h1>

            <motion.p {...fadeUp(0.2)} className="mt-6 text-[16px] sm:text-[18px] text-label-secondary leading-relaxed max-w-lg">
              Olvídate del cuaderno y del caos en WhatsApp. GoClient es el asistente que gestiona citas, turnos y pagos mientras tú te enfocas en tus clientes.
            </motion.p>

            <motion.div {...fadeUp(0.3)} className="mt-10 flex flex-col sm:flex-row items-start gap-4">
              <GoogleSignInButton label="Unirme a GoClient" className="!h-[52px] w-full sm:w-auto !rounded-full !text-[15px] !font-bold sm:!px-8 !bg-brand !text-white !border-brand/20 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all" />
              <a href="#producto" className="inline-flex h-[52px] w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-[rgba(0,0,0,0.08)] bg-white px-7 text-[15px] font-bold text-label-primary transition-all duration-200 hover:bg-[#f5f5f4] hover:border-[rgba(0,0,0,0.12)] active:scale-[0.97] shadow-sm">
                Ver cómo funciona <ArrowRight className="h-4 w-4" />
              </a>
            </motion.div>

            <motion.div {...fadeUp(0.35)} className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-label-tertiary font-semibold">
              <span className="inline-flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-emerald-500" /> 7 días gratis</span>
              <span className="w-1 h-1 rounded-full bg-[rgba(0,0,0,0.15)]" />
              <span className="inline-flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-emerald-500" /> Sin tarjetas</span>
              <span className="w-1 h-1 rounded-full bg-[rgba(0,0,0,0.15)]" />
              <span className="inline-flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-emerald-500" /> Perfil en 1 minuto</span>
            </motion.div>
          </div>

          {/* Visual Column */}
          <motion.div {...fadeUp(0.2)} className="relative flex justify-center lg:justify-end">
            <HeroVisual />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

/* ─── Hero Nav ─── */
const HeroNav = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`fixed left-0 right-0 top-0 z-50 pt-3 sm:pt-4 px-4 transition-all duration-300 ${scrolled ? 'translate-y-0' : ''}`}>
      <div className={`mx-auto max-w-6xl flex items-center justify-between px-5 py-2.5 rounded-full transition-all duration-300 ${
        scrolled ? 'bg-white/85 backdrop-blur-xl border border-[rgba(0,0,0,0.06)] shadow-sm' : 'bg-transparent'
      }`}>
        <a href="#inicio" className="flex items-center gap-2.5" aria-label="GoClient inicio">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white text-[13px] font-black shadow-sm">G</div>
          <span className="text-[17px] font-extrabold tracking-tight text-label-primary">GoClient</span>
        </a>
        <nav className="hidden md:flex items-center gap-1" aria-label="Principal">
          {[
            { href: '#producto', label: 'Producto' },
            { href: '#como-funciona', label: 'Cómo funciona' },
            { href: '#unirte', label: 'Unirte' },
          ].map((link) => (
            <a key={link.href} href={link.href} className="rounded-full px-4 py-2 text-[13px] font-bold text-label-tertiary transition hover:bg-[#f5f5f4] hover:text-label-primary">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <a href="#unirte" className="hidden sm:inline-flex h-[38px] items-center justify-center gap-2 rounded-full bg-brand text-white px-5 text-[13px] font-bold shadow-sm transition-all duration-200 hover:brightness-110 active:scale-[0.97] border border-brand/20">
            Unirme <ArrowRight className="h-3.5 w-3.5" />
          </a>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="flex md:hidden h-9 w-9 items-center justify-center rounded-full bg-white border border-[rgba(0,0,0,0.06)] text-label-tertiary">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="mx-auto mt-2 max-w-[calc(100%-1rem)] rounded-2xl border border-[rgba(0,0,0,0.06)] bg-white p-4 shadow-lg md:hidden text-left">
            {[{ href: '#producto', label: 'Producto' }, { href: '#como-funciona', label: 'Cómo funciona' }, { href: '#unirte', label: 'Unirte' }].map((link) => (
              <a key={link.href} onClick={() => setMobileOpen(false)} href={link.href} className="block rounded-xl px-4 py-3 text-[14px] font-bold text-label-secondary hover:bg-[#f5f5f4] hover:text-label-primary">{link.label}</a>
            ))}
            <hr className="my-2 border-[rgba(0,0,0,0.06)]" />
            <a href="#unirte" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-xl px-4 py-3 text-[14px] font-bold text-brand">Comenzar <ArrowRight className="h-4 w-4" /></a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

/* ─── Hero Visual ─── */
const HeroVisual = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="relative w-full max-w-[500px]" aria-hidden="true">
      {/* Stage */}
      <div className="relative">
        {/* Grid */}
        <div className="absolute inset-0 bg-grid-subtle opacity-60 rounded-3xl" />

        {/* Arcs */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] animate-arc-spin">
          <div className="absolute inset-0 rounded-full border border-[rgba(249,75,37,0.08)]" />
          <div className="absolute inset-[30px] rounded-full border border-[rgba(249,75,37,0.06)]" />
          <div className="absolute inset-[60px] rounded-full border border-[rgba(163,230,53,0.08)]" />
          <div className="absolute inset-[90px] rounded-full border border-[rgba(249,75,37,0.04)]" />
        </div>

        {/* Glow Beam */}
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 w-[200px] h-[200px] rounded-full bg-glow-orange blur-[80px] animate-pulse-soft" />

        {/* Foundation */}
        <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 w-[70%] h-[4px] rounded-full bg-gradient-to-r from-transparent via-[rgba(249,75,37,0.15)] to-transparent" />

        {/* Orbit Dots */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] animate-orbit-spin">
          <span className="absolute left-1/2 top-0 -translate-x-1/2 w-2 h-2 rounded-full bg-brand/40" />
          <span className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-brand/30" />
          <span className="absolute left-1/2 bottom-0 -translate-x-1/2 w-2 h-2 rounded-full bg-lime/40" />
        </div>

        {/* Phone */}
        <div className="relative z-10 mx-auto w-[240px] sm:w-[280px] translate-y-8 sm:translate-y-10">
          <div className="relative rounded-[40px] border-[5px] border-label-primary bg-label-primary shadow-2xl overflow-hidden" style={{ aspectRatio: '9/16' }}>
            <div className="absolute inset-[4px] rounded-[36px] bg-[#FAF9F6] overflow-y-auto no-scrollbar">
              <div className="pt-10 pb-1 px-3">
                <div className="flex items-center justify-between px-2 pb-3 text-[10px] font-bold text-label-tertiary">
                  <span>9:41</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px]">LTE</span>
                    <div className="w-3.5 h-2 rounded-sm border border-label-quaternary relative"><div className="absolute left-0.5 top-0.5 bottom-0.5 right-0.5 bg-label-quaternary rounded-sm" /></div>
                  </div>
                </div>
                <div className="space-y-2.5 pb-2 text-left">
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[rgba(0,0,0,0.06)] shadow-sm">
                    <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center text-white text-[12px] font-bold">CR</div>
                    <div>
                      <p className="text-[11px] font-bold text-label-primary leading-tight">Carlos Barber</p>
                      <p className="text-[9px] text-label-secondary">Barbero Profesional</p>
                    </div>
                    <div className="ml-auto"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /></div>
                  </div>
                  <div className="text-[9px] font-extrabold uppercase tracking-wider text-label-tertiary px-1">Próximos turnos</div>
                  <div className="space-y-1.5">
                    {[
                      { time: '9:00', name: 'José M.', status: '✅ Listo' },
                      { time: '10:30', name: 'Pedro R.', status: '⏳ Espera' },
                      { time: '14:00', name: 'Luis F.', status: '✅ Listo' },
                    ].map((a, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-white border border-[rgba(0,0,0,0.04)] shadow-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-extrabold text-label-primary bg-[rgba(249,75,37,0.1)] px-1.5 py-0.5 rounded">{a.time}</span>
                          <span className="text-[10px] font-semibold text-label-primary">{a.name}</span>
                        </div>
                        <span className="text-[9px] font-bold text-label-tertiary">{a.status}</span>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    <div className="text-center p-2 rounded-xl bg-[rgba(249,75,37,0.08)] border border-[rgba(249,75,37,0.15)]">
                      <p className="text-[12px] font-extrabold text-label-primary"><CountUp value={12} /></p>
                      <p className="text-[7px] text-label-tertiary font-extrabold uppercase">Hoy</p>
                    </div>
                    <div className="text-center p-2 rounded-xl bg-white border border-[rgba(0,0,0,0.06)] shadow-xs">
                      <p className="text-[12px] font-extrabold text-label-primary"><CountUp value={47} /></p>
                      <p className="text-[7px] text-label-tertiary font-extrabold uppercase">Clientes</p>
                    </div>
                    <div className="text-center p-2 rounded-xl bg-white border border-[rgba(0,0,0,0.06)] shadow-xs">
                      <p className="text-[12px] font-extrabold text-label-primary">4.9</p>
                      <p className="text-[7px] text-label-tertiary font-extrabold uppercase">Rating</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-around border-t border-[rgba(0,0,0,0.04)] bg-white/95 backdrop-blur-sm px-2 py-2">
                {[
                  { icon: '📅', label: 'Hoy', active: true },
                  { icon: '✂️', label: 'Servicios', active: false },
                  { icon: '⚙️', label: 'Ajustes', active: false },
                ].map((tab, i) => (
                  <div key={i} className="flex flex-col items-center gap-0.5 px-3 cursor-pointer">
                    <span className="text-[12px]">{tab.icon}</span>
                    <span className={`text-[8px] font-extrabold ${tab.active ? 'text-label-primary' : 'text-label-tertiary'}`}>{tab.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-20"><div className="w-20 h-1 rounded-full bg-label-quaternary" /></div>
          </div>
          {/* Side buttons */}
          <div className="absolute -left-[3px] top-[72px] w-[3px] h-[30px] bg-[rgba(0,0,0,0.15)] rounded-l-md z-20" />
          <div className="absolute -left-[3px] top-[110px] w-[3px] h-[50px] bg-[rgba(0,0,0,0.15)] rounded-l-md z-20" />
          <div className="absolute -right-[3px] top-[80px] w-[3px] h-[40px] bg-[rgba(0,0,0,0.15)] rounded-r-md z-20" />
        </div>

        {/* Floating Cards */}
        <FloatCard
          className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4"
          delay={0.4}
        >
          <div className="text-left">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-label-tertiary uppercase tracking-wider">Agenda</span>
              <strong className="text-[18px] font-black text-label-primary"><CountUp value={24} /></strong>
            </div>
            <span className="text-[9px] text-label-tertiary font-semibold">citas esta semana</span>
            <div className="mt-2 h-1.5 rounded-full bg-[rgba(0,0,0,0.06)] overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                whileInView={{ width: '68%' }}
                viewport={{ once: true }}
                transition={{ duration: 1.6, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full bg-brand"
              />
            </div>
            <div className="mt-2 flex gap-1 flex-wrap">
              {['WhatsApp', 'Instagram', 'Link'].map((c) => (
                <span key={c} className="text-[8px] font-extrabold px-1.5 py-0.5 rounded-full bg-[rgba(0,0,0,0.04)] text-label-tertiary">{c}</span>
              ))}
            </div>
          </div>
        </FloatCard>

        <FloatCard
          className="absolute -bottom-2 -left-2 sm:-bottom-4 sm:-left-4"
          delay={0.8}
        >
          <div className="flex items-center gap-3 text-left min-w-[180px]">
            <div className="w-8 h-8 rounded-full bg-[rgba(0,0,0,0.06)] flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <strong className="text-[11px] font-bold text-label-primary block truncate">María G.</strong>
              <span className="text-[9px] text-label-tertiary font-semibold">Hoy · Corte 10:30</span>
            </div>
            <span className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 text-[10px] font-black">✓</span>
          </div>
        </FloatCard>

        <FloatCard
          className="absolute top-[30%] -left-3 sm:-left-5"
          delay={1.2}
        >
          <div className="text-left min-w-[140px]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-label-tertiary uppercase tracking-wider">Citas</span>
              <span className="text-[9px] text-label-tertiary font-semibold">por día</span>
            </div>
            <div className="flex items-end gap-1.5 h-[40px] mt-2">
              <motion.span initial={{ height: '26%' }} whileInView={{ height: '26%' }} className="w-4 bg-[rgba(0,0,0,0.06)] rounded-t-sm" />
              <motion.span initial={{ height: '26%' }} whileInView={{ height: '26%' }} className="w-4 bg-[rgba(0,0,0,0.06)] rounded-t-sm" />
              <div className="flex flex-col items-center gap-1">
                <motion.span
                  initial={{ height: '0%' }}
                  whileInView={{ height: '34%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="w-4 bg-brand rounded-t-sm"
                />
                <span className="text-[7px] font-extrabold text-label-primary text-center leading-none">
                  <em className="not-italic">Vie</em> <strong className="block">18</strong>
                </span>
              </div>
              <motion.span initial={{ height: '26%' }} whileInView={{ height: '26%' }} className="w-4 bg-[rgba(0,0,0,0.06)] rounded-t-sm" />
              <motion.span initial={{ height: '26%' }} whileInView={{ height: '26%' }} className="w-4 bg-[rgba(0,0,0,0.06)] rounded-t-sm" />
            </div>
          </div>
        </FloatCard>

        <FloatCard
          className="absolute bottom-[20%] -right-2 sm:-right-4"
          delay={1.6}
        >
          <div className="text-left min-w-[140px]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-label-tertiary font-semibold">Ago</span>
              <span className="text-[11px] font-bold text-label-primary">Sep</span>
              <span className="text-[11px] text-label-tertiary font-semibold">Oct</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex">
                {[1, 2, 3].map((a) => (
                  <div key={a} className="w-6 h-6 rounded-full bg-[rgba(0,0,0,0.06)] border-2 border-white -ml-1.5 first:ml-0" />
                ))}
              </div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-brand/10 text-brand">+4 hoy</span>
            </div>
          </div>
        </FloatCard>

        <FloatCard
          className="absolute top-[15%] -right-2 sm:-right-5"
          delay={2.0}
        >
          <div className="text-left min-w-[160px]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-label-tertiary uppercase tracking-wider">Confirmaciones</span>
              <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">+12%</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-[rgba(0,0,0,0.02)] border border-[rgba(0,0,0,0.04)] mt-1">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <div className="flex-1 min-w-0">
                <strong className="text-[10px] font-bold text-label-primary block">Listas para hoy</strong>
                <span className="text-[8px] text-label-tertiary font-semibold">12 citas confirmadas</span>
              </div>
            </div>
            <div className="mt-1.5 flex gap-1 flex-wrap">
              <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-[rgba(0,0,0,0.04)] text-label-tertiary">Recordatorio enviado</span>
              <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-[rgba(0,0,0,0.04)] text-label-tertiary">Pago registrado</span>
            </div>
          </div>
        </FloatCard>
      </div>
    </div>
  );
};

const FloatCard = ({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 40, scale: 0.92 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    className={`absolute z-20 rounded-xl bg-white/90 backdrop-blur-md border border-[rgba(0,0,0,0.06)] shadow-lg p-3 sm:p-3.5 ${className}`}
  >
    {children}
  </motion.div>
);

/* ─────────────────────────────────────────────── */
/*  PRODUCT SECTION (Bento Grid)                  */
/* ─────────────────────────────────────────────── */
const ProductSection = () => {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.05 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  const cards = [
    {
      title: 'Una sola agenda, aunque te escriban por todos lados',
      desc: 'WhatsApp, Instagram, link o mostrador: todo termina en el mismo calendario.',
      visual: 'calendar',
      tone: 'soft'
    },
    {
      title: 'Tus clientes reservan por donde prefieran',
      desc: 'Cada cita entra en un solo lugar, sin copiar mensajes ni cambiar de app.',
      visual: 'orbit',
      tone: 'lime'
    },
    {
      title: 'Recordatorios que salen solos',
      desc: 'Confirma a tiempo y reduce ausencias sin perseguir a cada cliente.',
      visual: 'reminder',
      tone: 'mint'
    },
    {
      title: 'Tu agenda no se cruza',
      desc: 'Evita citas duplicadas y bloquea huecos ocupados para que cada una caiga donde va.',
      visual: 'timeline',
      tone: 'soft',
      wide: true
    },
    {
      title: 'Cobra sin perseguir',
      desc: 'Anticipos, links de pago y cobros ligados a cada cita, sin transferencias perdidas en el chat.',
      visual: 'insights',
      tone: 'mint',
      wide: true
    },
  ];

  return (
    <section ref={ref} id="producto" className="py-20 md:py-28 bg-[#fafaf9] overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 md:mb-16 gap-6">
          <div>
            <Eyebrow className="bg-white border border-[rgba(0,0,0,0.06)] text-label-secondary shadow-sm mb-4">Todo en orden</Eyebrow>
            <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-extrabold tracking-tighter leading-[1.1] text-label-primary max-w-xl">
              Agendar no tiene que ser un enredo.
            </h2>
          </div>
          <p className="text-[15px] md:text-[17px] text-label-secondary max-w-md leading-relaxed lg:text-right">
            Tus clientes reservan por donde quieran. Tú ves citas, equipo y cobros en un solo lugar.
          </p>
        </div>

        {/* Row Top: 3 cards */}
        <div className="grid md:grid-cols-3 gap-5 md:gap-6">
          {cards.slice(0, 3).map((card, i) => (
            <ProductCard key={i} {...card} index={i} visible={visible} />
          ))}
        </div>

        {/* Row Bottom: 2 wide cards */}
        <div className="grid md:grid-cols-2 gap-5 md:gap-6 mt-5 md:mt-6">
          {cards.slice(3).map((card, i) => (
            <ProductCard key={i + 3} {...card} index={i + 3} visible={visible} />
          ))}
        </div>
      </div>
    </section>
  );
};

const ProductCard = ({ title, desc, visual, tone, wide, index, visible }: {
  title: string; desc: string; visual: string; tone: string; wide?: boolean; index: number; visible: boolean;
}) => {
  const toneMap: Record<string, string> = {
    soft: 'bg-white border-[rgba(0,0,0,0.06)]',
    lime: 'bg-white border-[rgba(163,230,53,0.2)]',
    mint: 'bg-white border-[rgba(0,0,0,0.06)]',
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 48 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.08 * index, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative rounded-3xl border ${toneMap[tone] || toneMap.soft} overflow-hidden hover:shadow-lg transition-all duration-500 ${wide ? 'md:col-span-1' : ''}`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Visual */}
      <div className="relative h-[180px] md:h-[200px] overflow-hidden" style={{ transform: 'translateZ(24px)' }}>
        <div className="absolute inset-0 bg-grid-subtle opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/40" />

        {/* Abstract rings */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[160px] h-[160px]">
          <span className="absolute inset-[10px] rounded-full border border-[rgba(0,0,0,0.04)]" />
          <span className="absolute inset-[30px] rounded-full border border-[rgba(0,0,0,0.03)]" />
          <span className="absolute inset-[50px] rounded-full border border-[rgba(0,0,0,0.02)]" />
        </div>

        {visual === 'calendar' && <CalendarVisual />}
        {visual === 'orbit' && <OrbitVisual />}
        {visual === 'reminder' && <ReminderVisual />}
        {visual === 'timeline' && <TimelineVisual />}
        {visual === 'insights' && <InsightsVisual />}

        <div className="absolute inset-0 bg-gradient-to-t from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* Copy */}
      <div className="p-5 md:p-6 text-left" style={{ transform: 'translateZ(12px)' }}>
        <h3 className="text-[16px] md:text-[17px] font-extrabold text-label-primary leading-snug">{title}</h3>
        <p className="mt-2 text-[13px] md:text-[14px] text-label-secondary leading-relaxed">{desc}</p>
      </div>
    </motion.article>
  );
};

/* ─── Product Visuals ─── */
const CalendarVisual = () => (
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="relative">
      <div className="w-[120px] h-[90px] bg-white rounded-xl border border-[rgba(0,0,0,0.06)] shadow-sm p-2">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[7px] font-extrabold px-1.5 py-0.5 rounded-full bg-brand/10 text-brand">Agenda unificada</span>
          <span className="text-[6px] text-label-tertiary">3 canales</span>
        </div>
        <div className="flex gap-1 mb-1.5">
          {['L', 'M', 'X', 'J'].map((d, i) => (
            <span key={d} className={`w-4 h-4 rounded-full text-[7px] font-bold flex items-center justify-center ${i === 1 ? 'bg-brand text-white' : 'bg-[rgba(0,0,0,0.04)] text-label-tertiary'}`}>{d}</span>
          ))}
        </div>
        <div className="flex gap-1">
          {['WA', 'IG', '↗'].map((c) => (
            <span key={c} className="text-[6px] font-extrabold px-1 py-0.5 rounded-full bg-[rgba(0,0,0,0.04)] text-label-tertiary">{c}</span>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const OrbitVisual = () => (
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="relative w-[100px] h-[100px]">
      <span className="absolute inset-0 rounded-full border border-[rgba(0,0,0,0.06)]" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-brand/10 flex items-center justify-center">
        <span className="w-2.5 h-2.5 rounded-full bg-brand" />
      </div>
      <span className="absolute left-1/2 -top-2 -translate-x-1/2 text-[8px] font-extrabold px-1.5 py-0.5 rounded-full bg-white border border-[rgba(0,0,0,0.06)] shadow-sm">WA</span>
      <span className="absolute -right-2 top-1/2 -translate-y-1/2 text-[8px] font-extrabold px-1.5 py-0.5 rounded-full bg-white border border-[rgba(0,0,0,0.06)] shadow-sm">IG</span>
      <span className="absolute left-1/2 -bottom-2 -translate-x-1/2 text-[8px] font-extrabold px-1.5 py-0.5 rounded-full bg-white border border-[rgba(0,0,0,0.06)] shadow-sm">↗</span>
    </div>
  </div>
);

const ReminderVisual = () => (
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="w-[130px] bg-white rounded-xl border border-[rgba(0,0,0,0.06)] shadow-sm p-2.5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Bell className="w-3 h-3 text-brand" />
          <span className="text-[8px] font-bold text-label-primary">Recordatorios</span>
        </div>
        <span className="text-[6px] font-extrabold px-1 py-0.5 rounded-full bg-emerald-50 text-emerald-600">Activo</span>
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[8px]">
          <span className="font-bold text-label-primary">Julia S.</span>
          <span className="text-label-tertiary">Enviado ✓</span>
        </div>
        <div className="flex items-center justify-between text-[8px]">
          <span className="font-bold text-label-primary">Mark R.</span>
          <span className="text-label-tertiary">Programado</span>
        </div>
      </div>
      <div className="mt-1.5 pt-1.5 border-t border-[rgba(0,0,0,0.04)] flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-brand" />
        <span className="text-[7px] text-label-tertiary">2 confirmaciones</span>
      </div>
    </div>
  </div>
);

const TimelineVisual = () => (
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="w-[160px] bg-white/90 rounded-xl border border-[rgba(0,0,0,0.06)] shadow-sm p-2.5">
      <div className="flex items-center gap-1 mb-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <span className="text-[7px] font-extrabold text-emerald-600">Martes · Sin cruces</span>
      </div>
      <div className="space-y-1.5 pl-3 border-l-2 border-[rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-2">
          <span className="text-[7px] font-bold text-label-tertiary">10:00</span>
          <span className="text-[8px] font-bold text-label-primary">Corte · Ana</span>
          <span className="text-[7px] text-emerald-600">✓</span>
        </div>
        <div className="flex items-center gap-2 opacity-50">
          <span className="text-[7px] font-bold text-label-tertiary">10:30</span>
          <span className="text-[8px] font-bold text-label-quaternary line-through">Duplicada</span>
          <span className="text-[7px] text-red-400">✕</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[7px] font-bold text-label-tertiary">14:00</span>
          <span className="text-[8px] font-bold text-label-primary">Facial · Luis</span>
          <span className="text-[7px] text-emerald-600">✓</span>
        </div>
      </div>
    </div>
  </div>
);

const InsightsVisual = () => (
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="w-[160px] bg-white/90 rounded-xl border border-[rgba(0,0,0,0.06)] shadow-sm p-2.5">
      <div className="flex items-center gap-1 mb-1">
        <span className="text-[7px] font-extrabold px-1.5 py-0.5 rounded-full bg-brand/10 text-brand">Hoy</span>
        <span className="text-[7px] text-label-tertiary">En vivo</span>
      </div>
      <div className="text-center mb-2">
        <span className="text-[8px] text-label-tertiary font-semibold">Ingresos del día</span>
        <strong className="block text-[16px] font-black text-label-primary">$840</strong>
      </div>
      <div className="flex gap-1 justify-center">
        <span className="text-[7px] px-1.5 py-0.5 rounded-full bg-[rgba(0,0,0,0.04)] text-label-tertiary">Anticipos 3</span>
        <span className="text-[7px] px-1.5 py-0.5 rounded-full bg-brand/10 text-brand font-bold">Cobrado $420</span>
        <span className="text-[7px] px-1.5 py-0.5 rounded-full bg-[rgba(0,0,0,0.04)] text-label-tertiary">Pendiente 2</span>
      </div>
    </div>
  </div>
);


/* ─────────────────────────────────────────────── */
/*  PAIN POINTS (Narrative)                       */
/* ─────────────────────────────────────────────── */
const PainSection = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.05 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  const pains = [
    {
      num: '01',
      title: 'Contestas lo mismo todo el día',
      quotes: ['¿Tienes espacio el jueves?', '¿A qué hora?'],
      desc: 'El chat se vuelve tu agenda y nadie la controla.',
      quoteSide: 'left'
    },
    {
      num: '02',
      title: 'Un espacio, dos clientes',
      desc: 'Anotas en papel, Excel y WhatsApp. Cuando se cruzan, pierdes tiempo, dinero y la confianza del cliente.',
      quoteSide: 'right'
    },
    {
      num: '03',
      title: 'Persigues confirmaciones',
      desc: 'Sin recordatorios claros, las citas que no llegan se comen tu semana.',
      quoteSide: 'center'
    },
    {
      num: '04',
      title: 'Te cancelan y el espacio se pierde',
      desc: 'Avisan tarde, no alcanzas a rellenar el turno y el día se te desarma sin aviso.',
      quoteSide: 'left'
    },
  ];

  return (
    <section ref={ref} id="solucion" className="py-20 md:py-28 bg-white overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Sticky Copy */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <Eyebrow className="bg-[#fafaf9] border border-[rgba(0,0,0,0.06)] text-label-secondary mb-4">Producto</Eyebrow>
              <h2 className="text-[clamp(1.8rem,3.5vw,2.6rem)] font-extrabold tracking-tighter leading-[1.1] text-label-primary">
                <span className="block">Deja de perseguir clientes.</span>
                <span className="block mt-2">Empieza a <span className="text-brand">dirigir tu agenda.</span></span>
              </h2>
              <p className="mt-5 text-[15px] md:text-[16px] text-label-secondary leading-relaxed">
                Agenda, equipo y cobros en un solo flujo. Sin cuaderno ni chats perdidos. GoClient reúne servicios, disponibilidad, clientes y citas para negocios que viven de sus citas.
              </p>
              <a href="#unirte" className="mt-8 inline-flex h-[48px] items-center justify-center gap-2 rounded-full bg-brand text-white px-6 text-[14px] font-bold shadow-sm hover:shadow-lg hover:brightness-110 active:scale-[0.97] transition-all">
                Unirme a GoClient <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Cards */}
          <div className="lg:col-span-7 space-y-6">
            {pains.map((p, i) => (
              <motion.article
                key={i}
                initial={{ opacity: 0, y: 32 }}
                animate={visible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 * i, ease: [0.16, 1, 0.3, 1] }}
                className={`relative rounded-3xl border border-[rgba(0,0,0,0.06)] bg-white p-6 md:p-8 ${i % 2 === 1 ? 'md:ml-12' : ''} hover:shadow-md transition-shadow`}
              >
                <div className="absolute -top-3 -right-3 text-[40px] font-black text-[rgba(0,0,0,0.03)] select-none pointer-events-none">{p.num}</div>
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <div className="flex-1 text-left">
                    <span className="text-[11px] font-bold text-label-tertiary tracking-widest">{p.num}</span>
                    <h3 className="text-[18px] md:text-[20px] font-extrabold text-label-primary mt-1">{p.title}</h3>
                    {p.quotes && (
                      <div className="mt-3 space-y-1">
                        {p.quotes.map((q, j) => (
                          <div key={j} className={`inline-block px-3 py-1.5 rounded-full text-[12px] font-bold ${j === 0 ? 'bg-[rgba(249,75,37,0.06)] text-label-primary border border-[rgba(249,75,37,0.1)]' : 'bg-[rgba(0,0,0,0.03)] text-label-secondary border border-[rgba(0,0,0,0.06)]'}`}>
                            &ldquo;{q}&rdquo;
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="mt-3 text-[14px] text-label-secondary leading-relaxed">{p.desc}</p>
                  </div>
                  {/* Visual indicator */}
                  <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-[rgba(249,75,37,0.06)] border border-[rgba(249,75,37,0.1)] items-center justify-center flex-shrink-0">
                    <span className="text-[24px] font-black text-brand">{p.num === '04' ? '✕' : p.num === '03' ? '?' : p.num === '02' ? '×2' : '..."'}</span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────── */
/*  HOW IT WORKS (Numbered Steps)                 */
/* ─────────────────────────────────────────────── */
const HowItWorksSection = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.05 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  const steps = [
    {
      num: '01',
      title: 'Configura servicios y horarios',
      desc: 'Define qué ofreces, cuánto dura cada cita y qué espacios tienes disponibles.',
      visual: 'service'
    },
    {
      num: '02',
      title: 'Comparte tu disponibilidad',
      desc: 'Envía tu link o recibe citas desde WhatsApp, Instagram o en tu local.',
      visual: 'link'
    },
    {
      num: '03',
      title: 'Recibe citas claras',
      desc: 'Cada solicitud llega con servicio, hora y cliente. Sin perder el hilo del chat.',
      visual: 'orbit'
    },
    {
      num: '04',
      title: 'Confirma, recuerda y cobra',
      desc: 'Confirmaciones, recordatorios y pagos registrados en la misma agenda. Cierra el ciclo de cada cita.',
      visual: 'flow'
    },
  ];

  return (
    <section ref={ref} id="como-funciona" className="py-20 md:py-28 bg-[#fafaf9] overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="El proceso"
          title="El camino a una agenda bajo control."
          intro="Cuatro pasos simples para pasar del caos en chats a una cita clara y profesional."
        />

        <div className="space-y-16 md:space-y-20 mt-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={visible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 * i, ease: [0.16, 1, 0.3, 1] }}
              className={`grid md:grid-cols-2 gap-8 md:gap-16 items-center ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
            >
              {/* Visual */}
              <div className={`order-2 ${i % 2 === 1 ? 'md:order-2' : 'md:order-1'}`}>
                <div className="relative rounded-3xl border border-[rgba(0,0,0,0.06)] bg-white p-6 md:p-8 shadow-sm min-h-[140px] flex items-center justify-center">
                  <div className="absolute inset-0 bg-grid-subtle opacity-30 rounded-3xl" />
                  <div className="relative z-10">
                    {step.visual === 'service' && (
                      <div className="space-y-2 w-[180px]">
                        <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-[rgba(0,0,0,0.06)] shadow-sm">
                          <div><strong className="text-[12px] text-label-primary">Corte</strong><span className="text-[10px] text-label-tertiary ml-2">45 min · $25</span></div>
                          <span className="text-[10px] text-emerald-600">✓</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg bg-[rgba(0,0,0,0.02)] border border-[rgba(0,0,0,0.04)]">
                          <div><strong className="text-[12px] text-label-primary">Facial</strong><span className="text-[10px] text-label-tertiary ml-2">60 min · $40</span></div>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-brand/10 text-brand">10:00</span>
                          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-[rgba(0,0,0,0.04)] text-label-tertiary line-through">11:30</span>
                          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-brand/10 text-brand">14:00</span>
                        </div>
                      </div>
                    )}
                    {step.visual === 'link' && (
                      <div className="text-center w-[200px]">
                        <div className="px-4 py-2 rounded-xl bg-[rgba(0,0,0,0.02)] border border-[rgba(0,0,0,0.06)] text-[11px] font-bold text-brand font-mono">
                          goclient.app/tu-negocio
                        </div>
                        <div className="mt-3 flex items-center justify-center gap-2 text-[12px]">
                          <span className="text-label-tertiary">Citas hoy</span>
                          <strong className="text-[18px] font-black text-label-primary">8 <span className="text-[10px] font-bold text-emerald-600">↗</span></strong>
                        </div>
                      </div>
                    )}
                    {step.visual === 'orbit' && (
                      <div className="relative w-[100px] h-[100px]">
                        <span className="absolute inset-0 rounded-full border border-[rgba(0,0,0,0.06)]" />
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-brand/10 flex items-center justify-center"><span className="w-2.5 h-2.5 rounded-full bg-brand" /></div>
                        <span className="absolute left-1/2 -top-2 -translate-x-1/2 text-[8px] font-extrabold px-1.5 py-0.5 rounded-full bg-white border border-[rgba(0,0,0,0.06)] shadow-sm">WA</span>
                        <span className="absolute -right-2 top-1/2 -translate-y-1/2 text-[8px] font-extrabold px-1.5 py-0.5 rounded-full bg-white border border-[rgba(0,0,0,0.06)] shadow-sm">IG</span>
                        <span className="absolute left-1/2 -bottom-2 -translate-x-1/2 text-[8px] font-extrabold px-1.5 py-0.5 rounded-full bg-white border border-[rgba(0,0,0,0.06)] shadow-sm">↗</span>
                      </div>
                    )}
                    {step.visual === 'flow' && (
                      <div className="space-y-1.5 w-[180px]">
                        {[
                          { time: '10:30', name: 'Corte · María', status: 'OK' },
                          { time: '14:00', name: 'Facial · Ana', status: 'Enviado' },
                          { time: '16:30', name: 'Uñas · Lucía', status: 'Pend.' },
                        ].map((item, j) => (
                          <div key={j} className="flex items-center justify-between p-2 rounded-lg bg-white border border-[rgba(0,0,0,0.04)] shadow-xs">
                            <span className="text-[9px] font-bold text-label-tertiary">{item.time}</span>
                            <span className="text-[10px] font-bold text-label-primary">{item.name}</span>
                            <span className={`text-[8px] font-extrabold ${item.status === 'OK' ? 'text-emerald-600' : item.status === 'Enviado' ? 'text-brand' : 'text-label-tertiary'}`}>{item.status}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Copy */}
              <div className={`order-1 ${i % 2 === 1 ? 'md:order-1' : 'md:order-2'} text-left`}>
                <span className="text-[40px] font-black text-[rgba(249,75,37,0.1)] leading-none block">{step.num}</span>
                <h3 className="text-[22px] md:text-[24px] font-extrabold text-label-primary mt-2">{step.title}</h3>
                <p className="mt-3 text-[15px] text-label-secondary leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────── */
/*  AUDIENCE (Scrolling Ticker)                   */
/* ─────────────────────────────────────────────── */
const AudienceSection = () => {
  const professions1 = ['Salones de belleza', 'Barberías', 'Spas', 'Estudios de uñas', 'Cejas y pestañas', 'Clínicas dentales', 'Consultorios médicos', 'Fisioterapia', 'Psicología', 'Nutrición', 'Veterinarias'];
  const professions2 = ['Entrenadores personales', 'Yoga y pilates', 'Tatuadores', 'Masajes y bienestar', 'Depilación', 'Micropigmentación', 'Fotografía', 'Asesorías', 'Talleres y clases', 'Profesionales independientes'];

  return (
    <section className="py-20 md:py-28 bg-label-primary text-white overflow-hidden relative">
      <div className="pointer-events-none absolute left-0 top-0 w-[300px] h-full bg-gradient-to-r from-brand/5 to-transparent" aria-hidden="true" />
      <div className="pointer-events-none absolute right-0 top-0 w-[300px] h-full bg-gradient-to-l from-brand/5 to-transparent" aria-hidden="true" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center mb-12">
        <Eyebrow className="bg-white/10 border border-white/10 text-white/70 !backdrop-blur-sm">Para quién es</Eyebrow>
        <h2 className="mt-5 text-[clamp(1.8rem,4vw,3rem)] font-extrabold tracking-tighter leading-[1.1] text-white max-w-2xl mx-auto">
          Si tu día depende de una agenda, GoClient es para ti.
        </h2>
      </div>

      <div className="space-y-4 overflow-hidden">
        {/* Row 1 */}
        <div className="relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-10 z-10 bg-gradient-to-r from-label-primary to-transparent" />
          <div className="absolute right-0 top-0 bottom-0 w-10 z-10 bg-gradient-to-l from-label-primary to-transparent" />
          <div className="flex gap-3 animate-ticker-scroll" style={{ width: 'max-content' }}>
            {[...professions1, ...professions1].map((p, i) => (
              <span key={i} className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 border border-white/5 text-white text-[13px] font-bold whitespace-nowrap backdrop-blur-sm">
                {p}
              </span>
            ))}
          </div>
        </div>

        {/* Row 2 */}
        <div className="relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-10 z-10 bg-gradient-to-r from-label-primary to-transparent" />
          <div className="absolute right-0 top-0 bottom-0 w-10 z-10 bg-gradient-to-l from-label-primary to-transparent" />
          <div className="flex gap-3 animate-ticker-scroll-reverse" style={{ width: 'max-content' }}>
            {[...professions2, ...professions2].map((p, i) => (
              <span key={i} className="inline-flex items-center px-4 py-2 rounded-full bg-white/8 border border-white/5 text-white/80 text-[13px] font-bold whitespace-nowrap backdrop-blur-sm">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────── */
/*  EMOTIONAL SECTION                             */
/* ─────────────────────────────────────────────── */
const EmotionalSection = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.1 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  const pillars = [
    { icon: Clock, title: 'Más claridad', sub: 'para ti.' },
    { icon: Users, title: 'Más facilidad', sub: 'para tus clientes.' },
    { icon: Zap, title: 'Más orden', sub: 'para tu negocio.' },
  ];

  return (
    <section ref={ref} className="py-20 md:py-28 bg-white overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Copy */}
          <div className="lg:col-span-5 text-left">
            <Eyebrow className="bg-[#fafaf9] border border-[rgba(0,0,0,0.06)] text-label-secondary mb-4">
              Lo más importante: tu tranquilidad
            </Eyebrow>
            <h2 className="text-[clamp(1.8rem,3.5vw,2.6rem)] font-extrabold tracking-tighter leading-[1.1] text-label-primary">
              Agenda llena,{' '}
              <span className="text-brand">mente tranquila.</span>
            </h2>
            <p className="mt-5 text-[15px] md:text-[16px] text-label-secondary leading-relaxed">
              GoClient nace para acompañar a quienes atienden, responden, organizan y hacen crecer su negocio todos los días. Porque tener más citas no debería significar más caos.
            </p>
          </div>

          {/* Visual */}
          <div className="lg:col-span-7 relative">
            <div className="relative rounded-3xl overflow-hidden bg-[rgba(249,75,37,0.04)] border border-[rgba(0,0,0,0.06)] min-h-[260px] flex items-center justify-center">
              <div className="absolute inset-0 bg-grid-subtle opacity-40" />
              <div className="relative z-10 p-8 w-full">
                {/* Floating cards */}
                <div className="grid gap-3 max-w-sm mx-auto">
                  <motion.div
                    initial={{ opacity: 0, y: 16, scale: 0.98 }}
                    animate={visible ? { opacity: 1, y: 0, scale: 1 } : {}}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="rounded-2xl bg-white border border-[rgba(0,0,0,0.06)] shadow-sm p-4 flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <span className="text-[11px] text-label-tertiary font-semibold">Citas de hoy</span>
                      <strong className="block text-[20px] font-black text-label-primary"><CountUp value={10} /></strong>
                    </div>
                    <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">¡Todo bajo control!</span>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 16, scale: 0.98 }}
                    animate={visible ? { opacity: 1, y: 0, scale: 1 } : {}}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="rounded-2xl bg-white border border-[rgba(0,0,0,0.06)] shadow-sm p-4"
                  >
                    <span className="text-[11px] text-label-tertiary font-semibold">Próxima cita</span>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand/10 text-brand text-[10px] font-black flex items-center justify-center">PG</div>
                        <div>
                          <strong className="text-[14px] font-black text-label-primary block">3:30 PM</strong>
                          <span className="text-[11px] text-label-secondary">Paola G.</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-label-tertiary" />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 16, scale: 0.98 }}
                    animate={visible ? { opacity: 1, y: 0, scale: 1 } : {}}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="rounded-2xl bg-white border border-[rgba(0,0,0,0.06)] shadow-sm p-4 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-[11px] text-label-tertiary font-semibold">Ingresos del día</span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <strong className="text-[20px] font-black text-label-primary">$4,250</strong>
                        <span className="text-[11px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">+28%</span>
                      </div>
                    </div>
                    <svg viewBox="0 0 48 22" className="w-12 h-5 text-emerald-500" preserveAspectRatio="none">
                      <path d="M0 16 C8 14 12 8 20 10 S32 4 48 2" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                    </svg>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pillars */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          {pillars.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={visible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.1 * i }}
                className="flex items-center gap-4 p-4 rounded-2xl bg-[#fafaf9] border border-[rgba(0,0,0,0.06)]"
              >
                <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-brand" />
                </div>
                <div>
                  <strong className="text-[14px] font-extrabold text-label-primary">{p.title}</strong>
                  <span className="text-[13px] text-label-secondary block">{p.sub}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────── */
/*  TESTIMONIALS                                  */
/* ─────────────────────────────────────────────── */
const TESTIMONIALS = [
  { name: 'Carlos Ramírez', role: 'Barbero — Caracas', text: 'Desde que uso GoClient mi agenda se mantiene llena sin complicarme. Mis clientes reservan solos sin tener que responder mensajes a medianoche.', rating: 5 },
  { name: 'Dra. María Pérez', role: 'Odontóloga — Maracaibo', text: 'Mis pacientes agendan sus citas online al instante. Ya no tengo el teléfono saturado con solicitudes de turno.', rating: 5 },
  { name: 'Luis Fernández', role: 'Fotógrafo — Valencia', text: 'Para mis sesiones necesito bloques de tiempo exactos. GoClient se adapta a la perfección y mis clientes confirman su reserva de una.', rating: 5 },
  { name: 'Sofía Rivas', role: 'Estilista — Lechería', text: 'Mis clientas agendan de forma autónoma. Es un sistema limpio, rápido y sin dar tantas vueltas coordinando disponibilidad.', rating: 5 },
];

const TestimonialsSection = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.1 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-20 md:py-28 bg-[#fafaf9]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeader eyebrow={<><Quote className="h-3.5 w-3.5" /> Testimonios</>} title="Lo que opinan los profesionales que ya usan GoClient" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={visible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.05 * i }}
              className="rounded-2xl border border-[rgba(0,0,0,0.06)] bg-white p-5 shadow-sm hover:shadow-md transition-all text-left"
            >
              <div className="flex gap-1 mb-3">
                {Array.from({ length: t.rating }).map((_, j) => <Star key={j} className="h-3.5 w-3.5 fill-current text-yellow-500" />)}
              </div>
              <p className="text-[13px] leading-relaxed text-label-secondary font-medium">&ldquo;{t.text}&rdquo;</p>
              <div className="mt-4 pt-3 border-t border-[rgba(0,0,0,0.06)]">
                <p className="text-[13px] font-extrabold text-label-primary">{t.name}</p>
                <p className="text-[11px] text-label-tertiary font-extrabold uppercase tracking-wide">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────── */
/*  PRICING                                       */
/* ─────────────────────────────────────────────── */
const PricingSection = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);

  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.1 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  const plans = [
    {
      name: 'Plan Emprendedor',
      price: isAnnual ? 8 : 10,
      desc: 'Para profesionales que resuelven solos',
      features: ['Tu link personalizado (goclient.app/tunombre)', 'Agenda visual y disponibilidad en tiempo real', 'Servicios ilimitados', 'Configuración de Pago Móvil, Binance, etc.', 'Notificaciones de reservas al instante'],
      cta: 'Comenzar prueba gratis'
    },
    {
      name: 'Plan Negocio',
      price: isAnnual ? 24 : 30,
      desc: 'Para locales con equipo de trabajo',
      features: ['Todo lo del Plan Emprendedor', 'Enlaces individuales por cada miembro', 'Panel de control central de todo el equipo', 'Horarios independientes por profesional', 'Estadísticas de facturación colectiva', 'Soporte prioritario'],
      cta: 'Comenzar prueba gratis',
      featured: true
    },
  ];

  return (
    <section ref={ref} id="planes" className="py-20 md:py-28 bg-white border-y border-[rgba(0,0,0,0.06)]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <SectionHeader eyebrow="Planes claros" title="Precios sinceros y al grano" intro="Prueba gratis GoClient por 7 días. Después, elige el plan que te sirva. Cancela cuando quieras." />

        {/* Toggle */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <span className={`text-[13px] font-bold ${!isAnnual ? 'text-label-primary' : 'text-label-tertiary'}`}>Mensual</span>
          <button onClick={() => setIsAnnual(!isAnnual)} className="w-11 h-6 rounded-full bg-label-primary p-0.5 transition-colors relative">
            <div className={`w-5 h-5 rounded-full bg-brand transition-transform ${isAnnual ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
          <span className={`text-[13px] font-bold ${isAnnual ? 'text-label-primary' : 'text-label-tertiary'} inline-flex items-center gap-1.5`}>
            Anual <span className="text-[10px] font-extrabold bg-brand/10 text-brand px-1.5 py-0.5 rounded uppercase">Ahorra 20%</span>
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {plans.map((p, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={visible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.1 * i }}
              className={`relative rounded-3xl p-6 sm:p-8 transition-all duration-300 bg-white ${
                p.featured ? 'shadow-xl border-2 border-brand' : 'border border-[rgba(0,0,0,0.06)] hover:shadow-md'
              }`}
            >
              {p.featured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-brand text-white px-4 py-1 text-[11px] font-extrabold shadow-sm">
                  <Star className="h-3 w-3 fill-current" /> Más popular
                </div>
              )}
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-[15px] font-extrabold text-label-tertiary">$</span>
                <span className="text-[clamp(2.5rem,5vw,3.5rem)] font-black tracking-tight text-label-primary">{p.price}</span>
                <span className="text-[13px] text-label-tertiary font-extrabold">/mes</span>
              </div>
              <h3 className="mt-4 text-[20px] font-extrabold text-label-primary">{p.name}</h3>
              <p className="mt-1 text-[13px] text-label-secondary font-semibold">{p.desc}</p>
              <ul className="mt-6 space-y-3">
                {p.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-[13px] text-label-secondary font-semibold leading-tight text-left">
                    <Check className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600 bg-emerald-50 border border-emerald-100 p-0.5 rounded-full" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a href="/login" className="mt-8 flex h-12 w-full items-center justify-center rounded-full text-[14px] font-bold transition-all duration-200 hover:brightness-105 active:scale-[0.98] shadow-sm"
                style={{ backgroundColor: p.featured ? ORANGE : '#0a0915', color: '#ffffff' }}
              >{p.cta}</a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────── */
/*  FAQ                                           */
/* ─────────────────────────────────────────────── */
const FAQS = [
  { q: '¿Qué necesito para empezar?', a: 'Solo tu cuenta de Google. En menos de un minuto tienes tu perfil listo para compartirlo con tus clientes.' },
  { q: '¿Cuánto cuesta GoClient?', a: 'El Plan Emprendedor cuesta $10 al mes y el Plan Negocio $30 al mes. Si pagas el año completo, te ahorras un 20%. Ambos cuentan con 7 días de prueba.' },
  { q: '¿Cómo cobro mis citas?', a: 'Tus clientes te pagan directamente a ti. Al reservar, verán tus datos de Pago Móvil, Binance Pay o transferencia. No retenemos tu dinero ni cobramos comisiones.' },
  { q: '¿Funciona para mi tipo de profesión?', a: '¡Totalmente! GoClient está diseñado para barberos, odontólogos, estilistas, tatuadores, entrenadores, asesores y cualquier profesional que trabaje bajo agendamiento.' },
  { q: '¿Qué es el Plan Negocio?', a: 'Es ideal para locales o estudios con varios profesionales. Cada miembro del equipo recibe un enlace individual, y tú puedes administrar todos los horarios y estadísticas desde un panel centralizado.' },
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
    <section ref={ref} id="faq" className="py-20 bg-[#fafaf9]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeader eyebrow={<HelpCircle className="h-3.5 w-3.5" />} title="Preguntas frecuentes" />
        <div className="space-y-3 mt-8">
          {FAQS.map(({ q, a }, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={visible ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.05 * i }}
              className="rounded-2xl border border-[rgba(0,0,0,0.06)] bg-white overflow-hidden hover:border-brand/20 transition-colors shadow-sm"
            >
              <button onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 sm:px-6 py-4 sm:py-5 text-left text-[14px] sm:text-[15px] font-bold text-label-primary transition hover:text-brand"
              >
                <span>{q}</span>
                <ChevronDown className={`h-4 w-4 shrink-0 text-label-tertiary transition-transform duration-300 ${open === i ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <p className="px-5 sm:px-6 pb-5 sm:pb-6 text-[13px] sm:text-[14px] leading-relaxed text-label-secondary border-t border-[rgba(0,0,0,0.06)] pt-3">{a}</p>
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

/* ─────────────────────────────────────────────── */
/*  FINAL CTA (Waitlist / Sign Up)                */
/* ─────────────────────────────────────────────── */
const FinalCTASection = () => (
  <section id="unirte" className="py-20 md:py-28 relative overflow-hidden bg-label-primary text-white">
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-glow-orange blur-3xl" />
    </div>
    <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
      <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* Message */}
        <div className="lg:col-span-5 text-left">
          <Eyebrow className="bg-white/10 border border-white/10 text-white/70 !backdrop-blur-sm">Sé de los primeros</Eyebrow>
          <h2 className="mt-5 text-[clamp(1.8rem,3.5vw,2.8rem)] font-extrabold tracking-tighter leading-[1.1] text-white">
            Sé de los primeros en probar{' '}
            <span className="text-brand">GoClient.</span>
          </h2>
          <p className="mt-4 text-[15px] text-white/60 leading-relaxed max-w-sm">
            Crea tu perfil gratis en menos de un minuto. Sin tarjetas de crédito, sin compromisos.
          </p>
        </div>

        {/* Form */}
        <div className="lg:col-span-4">
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="flex flex-col gap-3">
              <GoogleSignInButton label="Unirme a GoClient" className="!h-[52px] w-full !rounded-full !text-[15px] !font-bold !bg-brand !text-white !border-brand/20 shadow-lg hover:shadow-xl active:scale-[0.98] transition-all" />
              <p className="text-[11px] text-white/40 text-center font-semibold">Sin descargas · Configuración en 1 minuto</p>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="lg:col-span-3 space-y-4">
          {[
            { icon: Bell, title: 'Novedades exclusivas', desc: 'Recibe avances antes que todos.' },
            { icon: Clock, title: 'Acceso anticipado', desc: 'Sé de los primeros en probar funciones.' },
            { icon: Users, title: 'Comunidad GoClient', desc: 'Únete a negocios que viven de sus citas.' },
          ].map((b, i) => {
            const Icon = b.icon;
            return (
              <motion.div key={i}
                initial={{ opacity: 0, x: 10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.05 * i }}
                className="flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-white/70" />
                </div>
                <div>
                  <strong className="text-[13px] font-extrabold text-white">{b.title}</strong>
                  <span className="text-[12px] text-white/50 block">{b.desc}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  </section>
);

/* ─────────────────────────────────────────────── */
/*  FOOTER                                        */
/* ─────────────────────────────────────────────── */
const FooterSection = () => (
  <footer className="border-t border-[rgba(0,0,0,0.06)] px-4 sm:px-6 py-12 md:py-16 bg-white">
    <div className="mx-auto max-w-6xl">
      <div className="grid sm:grid-cols-12 gap-8 text-left">
        {/* Brand */}
        <div className="sm:col-span-4">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white text-[13px] font-black shadow-sm">G</div>
            <span className="text-[16px] sm:text-[17px] font-extrabold tracking-tight text-label-primary">GoClient</span>
          </div>
          <p className="text-[13px] leading-relaxed max-w-xs text-label-secondary font-semibold">La agenda inteligente para negocios que viven de sus citas.</p>
          <div className="mt-4">
            <p className="text-[10px] font-bold text-label-tertiary uppercase tracking-wider mb-2">Próximamente en</p>
            <div className="flex gap-2">
              <span className="text-[11px] font-extrabold px-3 py-1.5 rounded-full bg-[rgba(0,0,0,0.04)] border border-[rgba(0,0,0,0.06)] text-label-tertiary">App Store</span>
              <span className="text-[11px] font-extrabold px-3 py-1.5 rounded-full bg-[rgba(0,0,0,0.04)] border border-[rgba(0,0,0,0.06)] text-label-tertiary">Google Play</span>
            </div>
          </div>
        </div>

        {/* Product */}
        <div className="sm:col-span-2">
          <h4 className="text-[11px] font-bold mb-3 uppercase tracking-wider text-label-tertiary">Producto</h4>
          <div className="flex flex-col gap-2">
            <a href="#producto" className="text-[13px] text-label-secondary hover:text-label-primary font-semibold transition">Funciones</a>
            <a href="#solucion" className="text-[13px] text-label-secondary hover:text-label-primary font-semibold transition">Beneficios</a>
            <a href="#como-funciona" className="text-[13px] text-label-secondary hover:text-label-primary font-semibold transition">Cómo funciona</a>
          </div>
        </div>

        {/* Company */}
        <div className="sm:col-span-2">
          <h4 className="text-[11px] font-bold mb-3 uppercase tracking-wider text-label-tertiary">Empresa</h4>
          <div className="flex flex-col gap-2">
            <a href="#comunidad" className="text-[13px] text-label-secondary hover:text-label-primary font-semibold transition">Sobre GoClient</a>
            <a href="#unirte" className="text-[13px] text-label-secondary hover:text-label-primary font-semibold transition">Contacto</a>
          </div>
        </div>

        {/* Legal & Social */}
        <div className="sm:col-span-4">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-[11px] font-bold mb-3 uppercase tracking-wider text-label-tertiary">Legal</h4>
              <div className="flex flex-col gap-2">
                <span className="text-[13px] text-label-tertiary font-semibold cursor-pointer">Términos</span>
                <span className="text-[13px] text-label-tertiary font-semibold cursor-pointer">Privacidad</span>
                <span className="text-[13px] text-label-tertiary font-semibold cursor-pointer">Cookies</span>
              </div>
            </div>
            <div>
              <h4 className="text-[11px] font-bold mb-3 uppercase tracking-wider text-label-tertiary">Síguenos</h4>
              <div className="flex gap-2">
                <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-[rgba(0,0,0,0.04)] border border-[rgba(0,0,0,0.06)] flex items-center justify-center text-label-tertiary hover:text-label-primary hover:bg-[rgba(0,0,0,0.06)] transition-all" aria-label="Instagram">
                  <svg stroke="currentColor" fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-[rgba(0,0,0,0.04)] border border-[rgba(0,0,0,0.06)] flex items-center justify-center text-label-tertiary hover:text-label-primary hover:bg-[rgba(0,0,0,0.06)] transition-all" aria-label="LinkedIn">
                  <svg stroke="currentColor" fill="currentColor" viewBox="0 0 448 512" className="w-4 h-4"><path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"/></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-[rgba(0,0,0,0.06)] flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-label-tertiary font-semibold">
        <p>&copy; 2026 GoClient. Todos los derechos reservados.</p>
        <p>Hecho con <span className="text-brand" aria-hidden="true">&hearts;</span> para negocios que viven de sus citas.</p>
      </div>
    </div>
  </footer>
);

/* ─────────────────────────────────────────────── */
/*  MAIN EXPORT                                   */
/* ─────────────────────────────────────────────── */
export default function LandingClient() {
  return (
    <div className="overflow-x-hidden min-h-screen bg-[#fafaf9] text-label-primary selection:bg-brand/20 selection:text-label-primary">
      <main>
        <HeroSection />
        <ProductSection />
        <PainSection />
        <HowItWorksSection />
        <AudienceSection />
        <EmotionalSection />
        <TestimonialsSection />
        <PricingSection />
        <FaqSection />
        <FinalCTASection />
      </main>
      <FooterSection />
    </div>
  );
}
