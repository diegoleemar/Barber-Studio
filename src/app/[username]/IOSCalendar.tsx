'use client';

import { useMemo, useState } from 'react';
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
        <h3 className="text-headline">
          {MESES[cursor.getMonth()]} {cursor.getFullYear()}
        </h3>
        <div className="flex gap-1">
          <button
            onClick={() => navigate(-1)}
            disabled={!canGoBack}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-700 text-white transition hover:bg-ink-600 disabled:opacity-40"
            aria-label="Mes anterior"
          >
            ‹
          </button>
          <button
            onClick={() => navigate(1)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-700 text-white transition hover:bg-ink-600"
            aria-label="Mes siguiente"
          >
            ›
          </button>
        </div>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[11px] font-medium uppercase tracking-wider text-label-tertiary">
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
              className={`flex aspect-square items-center justify-center rounded-full text-[15px] font-medium transition ${
                isSelected
                  ? 'bg-gold text-black'
                  : isToday
                    ? 'ring-2 ring-gold/70 text-white'
                    : disabled
                      ? 'text-label-tertiary'
                      : 'text-white hover:bg-ink-700'
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
