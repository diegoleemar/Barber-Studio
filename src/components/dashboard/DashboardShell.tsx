'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Profile } from '@/lib/types';
import { useState, type ReactNode } from 'react';
import {
  CalendarDays, User, Scissors, Clock, CreditCard,
  Search, Plus, LogOut, Menu, X, Home, BarChart3, Settings,
  type LucideIcon
} from 'lucide-react';
import ToastHost from '@/components/ui/Toast';
import DashboardInsights from './DashboardInsights';

const ORANGE = '#f94b25';

function getNav(profile: Profile): { href: string; label: string; icon: LucideIcon }[] {
  const base = [
    { href: '/dashboard', label: 'Inicio', icon: Home },
    { href: '/dashboard', label: 'Agenda', icon: CalendarDays },
  ];
  const extras = [];
  const flowType = profile.profession?.booking_flow_type;
  if (flowType === 'interval' || flowType === 'block') {
    extras.push({ href: '/dashboard/servicios', label: 'Servicios', icon: Scissors });
  }
  extras.push({ href: '/dashboard/horarios', label: 'Horarios', icon: Clock });
  extras.push({ href: '/dashboard/perfil', label: 'Ajustes', icon: Settings });
  extras.push({ href: '/dashboard/pagos', label: 'Pagos', icon: CreditCard });
  return [...base, ...extras];
}

export default function DashboardShell({ profile, children }: { profile: Profile; children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const NAV = getNav(profile);

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  const topNav = [
    { href: '/dashboard', label: 'Inicio' },
    { href: '/dashboard', label: 'Clientes', disabled: true },
    { href: '/dashboard', label: 'Reportes', disabled: true },
    { href: '/dashboard/perfil', label: 'Ajustes' },
  ];

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      {/* ─── TOP BAR ─── */}
      <header className="sticky top-0 z-40 border-b border-[rgba(0,0,0,0.06)] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 items-center gap-3 px-4 lg:px-6">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f94b25] text-white text-[13px] font-black shadow-sm">G</div>
            <span className="hidden sm:inline text-[16px] font-extrabold tracking-tight text-[#0a0915]">GoClient</span>
          </Link>

          {/* Search */}
          <div className="hidden md:flex items-center gap-2 flex-1 max-w-xs ml-2 bg-[#f5f5f4] border border-[rgba(0,0,0,0.06)] rounded-full px-3.5 py-1.5">
            <Search className="h-4 w-4 text-[#a1a1aa]" />
            <input type="text" placeholder="Buscar citas, clientes..." className="flex-1 bg-transparent text-[13px] font-medium text-[#0a0915] placeholder:text-[#a1a1aa] outline-none" />
          </div>

          {/* Nav Tabs */}
          <nav className="hidden lg:flex items-center gap-0.5 ml-auto" aria-label="Navegación principal">
            {topNav.map((item) => (
              item.disabled ? (
                <span key={item.label} className="px-3 py-1.5 text-[13px] font-bold text-[#a1a1aa] cursor-not-allowed select-none">
                  {item.label}
                </span>
              ) : (
                <Link key={item.href + item.label} href={item.href}
                  className={`px-3 py-1.5 text-[13px] font-bold rounded-full transition-all duration-150 ${
                    isActive(item.href) ? 'bg-white text-[#0a0915] shadow-sm' : 'text-[#52525a] hover:text-[#0a0915] hover:bg-[#f5f5f4]'
                  }`}>
                  {item.label}
                </Link>
              )
            ))}
          </nav>

          {/* CTA */}
          <button className="hidden sm:inline-flex h-9 items-center gap-1.5 rounded-full bg-[#f94b25] text-white px-4 text-[13px] font-bold shadow-sm hover:brightness-110 active:scale-[0.97] transition-all ml-2 shrink-0 whitespace-nowrap">
            <Plus className="h-4 w-4" /> Nueva Cita
          </button>

          {/* Mobile menu toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="flex lg:hidden h-9 w-9 items-center justify-center rounded-full bg-[#f5f5f4] text-[#52525a] ml-auto shrink-0">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {mobileOpen && (
          <div className="border-t border-[rgba(0,0,0,0.06)] bg-white px-4 py-3 lg:hidden">
            <div className="flex items-center gap-2 mb-3 bg-[#f5f5f4] border border-[rgba(0,0,0,0.06)] rounded-full px-3.5 py-1.5">
              <Search className="h-4 w-4 text-[#a1a1aa]" />
              <input type="text" placeholder="Buscar citas, clientes..." className="flex-1 bg-transparent text-[13px] font-medium text-[#0a0915] placeholder:text-[#a1a1aa] outline-none" />
            </div>
            <div className="flex flex-col gap-0.5">
              {NAV.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-[14px] font-bold transition-all ${
                      active ? 'bg-[rgba(249,75,37,0.06)] text-[#f94b25]' : 'text-[#52525a] hover:bg-[#f5f5f4]'
                    }`}>
                    <Icon className={`h-5 w-5 ${active ? 'text-[#f94b25]' : 'text-[#a1a1aa]'}`} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
            <hr className="my-3 border-[rgba(0,0,0,0.06)]" />
            <form action="/auth/signout" method="post">
              <button type="submit" className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-[14px] font-bold text-[#52525a] hover:bg-[#f5f5f4] transition-all">
                <LogOut className="h-5 w-5 text-[#a1a1aa]" /> Cerrar sesión
              </button>
            </form>
          </div>
        )}
      </header>

      {/* ─── MAIN GRID ─── */}
      <div className="mx-auto max-w-[1400px] px-4 lg:px-6 py-5 lg:py-6">
        <div className="flex gap-6">

          {/* ─── LEFT SIDEBAR (desktop) ─── */}
          <aside className="hidden lg:flex flex-col gap-5 w-[230px] shrink-0">
            {/* Profile Card */}
            <div className="bg-white border border-[rgba(0,0,0,0.06)] rounded-[20px] p-5 text-center shadow-sm">
              {profile.photo_url ? (
                <img src={profile.photo_url} alt="" className="w-14 h-14 rounded-xl object-cover mx-auto mb-2.5 ring-2 ring-[rgba(249,75,37,0.2)]" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-[#f94b25] flex items-center justify-center mx-auto mb-2.5 shadow-sm text-white text-[20px] font-black">
                  {(profile.business_name || 'U').charAt(0)}
                </div>
              )}
              <div className="text-[17px] font-extrabold text-[#0a0915] tracking-tight">{profile.business_name}</div>
              <div className="text-[12px] text-[#52525a] font-semibold mt-0.5">{profile.profession?.name || 'Profesional'}</div>
              <div className="text-[11px] text-[#52525a] font-semibold flex items-center justify-center gap-1 mt-1.5">
                🚀 12 citas hoy &middot; 4.9 ★
              </div>
            </div>

            {/* Navigation Menu */}
            <div className="bg-white border border-[rgba(0,0,0,0.06)] rounded-[20px] p-2 shadow-sm">
              {NAV.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link key={item.href + item.label} href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-bold transition-all duration-150 ${
                      active ? 'bg-[rgba(249,75,37,0.06)] text-[#f94b25]' : 'text-[#52525a] hover:bg-[#f5f5f4] hover:text-[#0a0915]'
                    }`}>
                    <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? 'text-[#f94b25]' : 'text-[#a1a1aa]'}`} />
                    {item.label}
                  </Link>
                );
              })}
              <hr className="my-2 border-[rgba(0,0,0,0.06)]" />
              <form action="/auth/signout" method="post">
                <button type="submit"
                  className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-bold text-[#52525a] hover:bg-[#f5f5f4] hover:text-red-500 transition-all duration-150">
                  <LogOut className="h-[18px] w-[18px] shrink-0 text-[#a1a1aa]" />
                  Cerrar sesión
                </button>
              </form>
            </div>

            {/* Agenda Card */}
            <div className="bg-white border border-[rgba(0,0,0,0.06)] rounded-[20px] p-5 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#a1a1aa]">AGENDA</div>
              <div className="text-[32px] font-black text-[#0a0915] leading-none mt-1.5">30</div>
              <div className="text-[12px] text-[#52525a] font-semibold">citas esta semana</div>
              <div className="mt-3 h-1.5 rounded-full bg-[rgba(0,0,0,0.04)] overflow-hidden">
                <div className="h-full w-[75%] rounded-full bg-[#f94b25]" />
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                {['WhatsApp', 'Instagram', 'Link'].map((c) => (
                  <span key={c} className="text-[10px] font-bold px-3 py-1 rounded-full bg-[rgba(0,0,0,0.04)] text-[#a1a1aa]">{c}</span>
                ))}
              </div>
            </div>
          </aside>

          {/* ─── CENTER CONTENT ─── */}
          <main className="flex-1 min-w-0">
            <div className="[&>div:first-child]:mt-0 [&>section:first-child]:mt-0">
              {children}
            </div>
          </main>

          {/* ─── RIGHT INSIGHTS PANEL (desktop) ─── */}
          <aside className="hidden lg:flex flex-col gap-4 w-[250px] shrink-0">
            <DashboardInsights profileId={profile.id} />
          </aside>

        </div>
      </div>

      {/* ─── BOTTOM NAV (mobile) ─── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-start justify-around border-t border-[rgba(0,0,0,0.06)] bg-white/95 backdrop-blur-xl safe-bottom pb-1 lg:hidden shadow-lg">
        {[
          { href: '/dashboard', label: 'Inicio', icon: Home },
          { href: '/dashboard', label: 'Agenda', icon: CalendarDays },
          { href: '/dashboard/servicios', label: 'Servicios', icon: Scissors },
          { href: '/dashboard/perfil', label: 'Ajustes', icon: Settings },
        ].map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href}
              className={`touch-target relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg pt-1.5 text-[10px] font-bold transition-all duration-150 ${
                active ? 'text-[#f94b25]' : 'text-[#a1a1aa]'
              }`}>
              {active && <div className="absolute -top-px left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-[#f94b25]" />}
              <Icon className={`h-[22px] w-[22px] ${active ? 'text-[#f94b25]' : 'text-[#a1a1aa]'}`} />
              <span className="text-[10px] leading-none">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ─── LOGOUT FAB (mobile only) ─── */}
      <form action="/auth/signout" method="post" className="fixed right-4 bottom-20 z-50 lg:hidden">
        <button type="submit" className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-[rgba(0,0,0,0.06)] text-[#52525a] shadow-lg transition-all duration-150 active:scale-90 hover:text-red-500">
          <LogOut className="h-5 w-5" />
        </button>
      </form>

      <ToastHost />
    </div>
  );
}
