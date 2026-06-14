'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DIAS_CORTOS, MESES, toDateKey } from '@/lib/time';

export default function IOSCalendar({
  value,
  onChange,
  isDayAvailable
}: {
  value: Date | null;
  onChange: (d: Date) => void;
  isDayAvailable?: (d: Date) => boolean;
}) {
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const [cursor, setCursor] = useState<Date>(() => {
    const d = value || today;
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const monthDays = useMemo(() => {
    const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const firstDay = start.getDay();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [cursor]);

  const navigate = (delta: number) => {
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));
  };

  const canGoBack =
    cursor.getFullYear() > today.getFullYear() ||
    (cursor.getFullYear() === today.getFullYear() && cursor.getMonth() > today.getMonth());

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[16px] font-extrabold text-neutral-900">
          {MESES[cursor.getMonth()]} {cursor.getFullYear()}
        </h3>
        <div className="flex gap-1">
          <button
            onClick={() => navigate(-1)}
            disabled={!canGoBack}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 transition hover:bg-neutral-200 hover:text-black disabled:opacity-30"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => navigate(1)}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 transition hover:bg-neutral-200 hover:text-black"
            aria-label="Mes siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-wider text-neutral-400">
        {DIAS_CORTOS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {monthDays.map((d, i) => {
          if (!d) return <div key={i} />;
          const past = d < today;
          const isToday = toDateKey(d) === toDateKey(today);
          const isSelected = value && toDateKey(d) === toDateKey(value);
          const available = isDayAvailable ? isDayAvailable(d) : true;
          const disabled = past || !available;

          return (
            <button
              key={i}
              disabled={disabled}
              onClick={() => onChange(d)}
              className={`touch-target-sm flex aspect-square items-center justify-center rounded-xl text-[14px] font-bold transition-all duration-150 ${
                isSelected
                  ? 'bg-[#d2ff00] text-black border border-black/10 shadow-sm'
                  : isToday
                    ? 'bg-[#FAF9F6] text-black ring-2 ring-[#d2ff00]'
                    : disabled
                      ? 'text-neutral-300'
                      : 'text-neutral-700 hover:bg-neutral-100 hover:text-black'
              }`}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
