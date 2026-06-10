'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Barber } from '@/lib/types';
import { useState, type ReactNode } from 'react';
import {
  CalendarDays,
  User,
  Scissors,
  Clock,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  LogOut,
  type LucideIcon
} from 'lucide-react';
import ToastHost from '@/components/ui/Toast';

const NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/dashboard', label: 'Agenda', icon: CalendarDays },
  { href: '/dashboard/perfil', label: 'Perfil', icon: User },
  { href: '/dashboard/servicios', label: 'Servicios', icon: Scissors },
  { href: '/dashboard/horarios', label: 'Horarios', icon: Clock },
  { href: '/dashboard/pagos', label: 'Pagos', icon: CreditCard }
];

export default function DashboardShell({ barber, children }: { barber: Barber; children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);

  const publicUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${barber.username}`;

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  return (
    <div className="flex min-h-screen bg-base-950">
      {/* ─── SIDEBAR (desktop) ─── */}
      <aside className={`fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-base-border bg-base-900 transition-all duration-300 lg:flex ${collapsed ? 'w-[56px]' : 'w-[240px]'}`}>
        <div className={`flex items-center border-b border-base-border ${collapsed ? 'justify-center px-0 py-3' : 'justify-between px-4 py-3.5'}`}>
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="" className="h-8 w-8 rounded-lg object-contain" />
            {!collapsed && <span className="text-[15px] font-semibold tracking-tight">Barber Studio</span>}
          </Link>
          {!collapsed && (
            <button onClick={() => setCollapsed(true)} className="btn-icon !h-7 !w-7">
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        <nav className="flex-1 space-y-0.5 px-2 py-3">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href}
                className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] font-medium transition-all duration-150 ${
                  collapsed ? 'justify-center px-0' : ''
                } ${active ? 'bg-glass-active text-white' : 'text-label-secondary hover:bg-glass-hover hover:text-label-primary'}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? 'text-brand' : ''}`} />
                {!collapsed && <span>{item.label}</span>}
                {active && <div className="absolute -left-2 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-brand" />}
              </Link>
            );
          })}
        </nav>

        <div className={`border-t border-base-border p-3 ${collapsed ? 'flex flex-col items-center gap-2' : 'space-y-3'}`}>
          <button onClick={copyLink} className={`flex items-center gap-2 rounded-lg transition-all duration-150 hover:bg-glass-hover ${
            collapsed ? 'justify-center p-2' : 'w-full px-3 py-2'
          }`} title={collapsed ? 'Copiar enlace' : undefined}>
            <div className={`flex items-center gap-2 ${collapsed ? '' : 'min-w-0'}`}>
              {copied ? <Check className="h-4 w-4 text-emerald-400 shrink-0" /> : <Copy className="h-4 w-4 text-label-tertiary shrink-0" />}
              {!collapsed && (
                <span className="truncate text-[12px] text-label-tertiary">
                  {copied ? 'Copiado' : `/${barber.username}`}
                </span>
              )}
            </div>
          </button>

          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2.5 rounded-lg px-2.5 py-2'}`}>
            {barber.foto_url ? (
              <img src={barber.foto_url} alt="" className="h-7 w-7 shrink-0 rounded-full object-cover ring-1 ring-glass-border" />
            ) : (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-base-600 text-[11px] font-medium text-label-secondary">
                {barber.nombre.charAt(0)}
              </div>
            )}
            {!collapsed && (
              <div className="flex min-w-0 flex-1 items-center justify-between">
                <span className="truncate text-[13px] font-medium">{barber.nombre}</span>
                <form action="/auth/signout" method="post">
                  <button type="submit" className="text-label-quaternary transition hover:text-label-secondary" title="Cerrar sesión">
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
            )}
          </div>

          {collapsed && (
            <button onClick={() => setCollapsed(false)} className="btn-icon !h-8 !w-8">
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </aside>

      {/* ─── CONTENT ─── */}
      <main className={`flex-1 w-full max-w-full transition-all duration-300 lg:pl-[240px] ${collapsed ? 'lg:!pl-[56px]' : ''}`}>
        <div className="mx-auto w-full max-w-6xl app-inset bottom-nav-inset pt-0 lg:px-8 lg:pt-8">
          {children}
        </div>
      </main>

      {/* ─── BOTTOM NAV (mobile) ─── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-start justify-around border-t border-base-border bg-base-900/95 backdrop-blur-xl safe-bottom pb-1 lg:hidden">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href}
              className={`touch-target relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg pt-1.5 text-[10px] font-medium transition-all duration-150 ${
                active ? 'text-brand' : 'text-label-tertiary'
              }`}>
              {active && <div className="absolute -top-px left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-brand" />}
              <Icon className={`h-[22px] w-[22px] ${active ? 'text-brand' : ''}`} />
              <span className="text-[10px] leading-none">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ─── LOGOUT FAB (mobile only) ─── */}
      <form action="/auth/signout" method="post" className="fixed right-4 bottom-20 z-50 lg:hidden">
        <button type="submit" className="flex h-12 w-12 items-center justify-center rounded-2xl bg-base-800 text-label-tertiary shadow-elevated ring-1 ring-glass-border transition-all duration-150 active:scale-90 hover:text-red-400">
          <LogOut className="h-5 w-5" />
        </button>
      </form>

      <ToastHost />
    </div>
  );
}
