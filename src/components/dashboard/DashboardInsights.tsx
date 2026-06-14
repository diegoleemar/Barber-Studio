'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toDateKey } from '@/lib/time';

export default function DashboardInsights({ profileId }: { profileId: string }) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let active = true;
    (async () => {
      const today = toDateKey(new Date());
      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 6);
      const { data } = await supabase
        .from('appointments')
        .select('*')
        .eq('profile_id', profileId)
        .gte('fecha', toDateKey(weekAgo))
        .order('fecha');
      if (active) { setAppointments(data || []); setLoading(false); }
    })();
    return () => { active = false; };
  }, [profileId, supabase]);

  useEffect(() => {
    const channel = supabase
      .channel(`insights-${profileId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments', filter: `profile_id=eq.${profileId}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setAppointments((arr) => [...arr, payload.new as any]);
        } else if (payload.eventType === 'UPDATE') {
          setAppointments((arr) => arr.map((a) => a.id === (payload.new as any).id ? payload.new as any : a));
        } else if (payload.eventType === 'DELETE') {
          setAppointments((arr) => arr.filter((a) => a.id !== (payload.old as any).id));
        }
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [profileId, supabase]);

  const todayKey = toDateKey(new Date());
  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  const todayAppts = appointments.filter((a) => a.fecha === todayKey);
  const confirmedToday = todayAppts.filter((a) => a.status === 'confirmed').length;
  const pendingToday = todayAppts.filter((a) => a.status === 'pending').length;
  const totalToday = todayAppts.length;

  const weekCounts = weekDays.map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return appointments.filter((a) => a.fecha === toDateKey(d)).length;
  });
  const maxCount = Math.max(...weekCounts, 1);

  const clients = new Set(appointments.map((a) => a.cliente_nombre)).size;

  const todayIdx = 6; // today is the last day in our 7-day window
  const todayCount = weekCounts[todayIdx];
  const yesterdayCount = weekCounts[todayIdx - 1] || 0;
  const deltaPercent = yesterdayCount > 0 ? Math.round(((todayCount - yesterdayCount) / yesterdayCount) * 100) : 0;

  return (
    <>
      {/* CITAS por día */}
      <div className="bg-white border border-[rgba(0,0,0,0.06)] rounded-[20px] p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#a1a1aa]">CITAS por día</h3>
          {!loading && deltaPercent !== 0 && (
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${deltaPercent > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
              {deltaPercent > 0 ? '+' : ''}{deltaPercent}%
            </span>
          )}
        </div>
        <div className="flex items-end gap-1.5 h-[72px]">
          {weekCounts.map((count, i) => {
            const pct = Math.max((count / maxCount) * 80, 4);
            const isToday = i === todayIdx;
            return (
              <div key={i} className="flex flex-col items-center gap-1 flex-1">
                <div
                  className={`w-full rounded-[4px_4px_0_0] transition-all duration-500 ${isToday ? 'bg-[#a3e635]' : 'bg-[rgba(0,0,0,0.06)]'}`}
                  style={{ height: `${pct}%` }}
                />
                <span className={`text-[8px] font-bold uppercase tracking-wide ${isToday ? 'text-[#0a0915]' : 'text-[#a1a1aa]'}`}>
                  {weekDays[i]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* CONFIRMACIONES */}
      <div className="bg-white border border-[rgba(0,0,0,0.06)] rounded-[20px] p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#a1a1aa]">CONFIRMACIONES</h3>
          {!loading && totalToday > 0 && (
            <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">+{Math.round((confirmedToday / totalToday) * 100)}%</span>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[rgba(0,0,0,0.02)]">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
            <div className="flex-1 min-w-0">
              <strong className="text-[11px] font-bold text-[#0a0915] block">Listas para hoy</strong>
              <span className="text-[9px] text-[#52525a] font-semibold">{totalToday > 0 ? `${confirmedToday} confirmadas de ${totalToday}` : 'Sin citas hoy'}</span>
            </div>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 shrink-0">{confirmedToday}</span>
          </div>
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[rgba(0,0,0,0.02)]">
            <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <strong className="text-[11px] font-bold text-[#0a0915] block">Pendientes</strong>
              <span className="text-[9px] text-[#52525a] font-semibold">{pendingToday > 0 ? `${pendingToday} citas por confirmar` : 'Todo al día'}</span>
            </div>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-600 shrink-0">{pendingToday}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="bg-white border border-[rgba(0,0,0,0.06)] rounded-[20px] p-5 shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-[0.06em] text-[#a1a1aa]">Ingresos</div>
            <div className="text-[22px] font-black text-[#0a0915] mt-0.5">${totalToday * 25}</div>
            <div className="text-[10px] font-bold text-emerald-600">+18%</div>
          </div>
          <div>
            <div className="text-[9px] font-bold uppercase tracking-[0.06em] text-[#a1a1aa]">Clientes</div>
            <div className="text-[22px] font-black text-[#0a0915] mt-0.5">{clients || '—'}</div>
            <div className="text-[10px] font-bold text-emerald-600">+12%</div>
          </div>
        </div>
      </div>
    </>
  );
}
