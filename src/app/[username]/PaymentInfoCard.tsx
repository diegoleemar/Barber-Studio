'use client';

import { useState } from 'react';
import type { PaymentMethod } from '@/lib/types';
import { PaymentIcon } from '@/components/icons/PaymentIcons';

const TITLES: Record<PaymentMethod['tipo'], string> = {
  pago_movil: 'Pago Móvil',
  transferencia: 'Transferencia',
  efectivo: 'Efectivo / Divisas'
};

export default function PaymentInfoCard({ method }: { method: PaymentMethod }) {
  const [copied, setCopied] = useState<string | null>(null);

  const fields = Object.entries(method.datos).filter(([_, v]) => v);

  const copy = (label: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(null), 1200);
  };

  const labelMap: Record<string, string> = {
    banco: 'Banco',
    telefono: 'Teléfono',
    cedula: 'Cédula',
    cuenta: 'Cuenta',
    titular: 'Titular',
    descripcion: 'Información'
  };

  return (
    <div className="ios-card">
      <div className="flex items-center gap-3 pb-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold">
          <PaymentIcon tipo={method.tipo} className="h-5 w-5" />
        </span>
        <h4 className="text-headline">{TITLES[method.tipo]}</h4>
      </div>
      <div className="ios-divider mb-2" />
      {fields.map(([k, v], i) => (
        <div key={k}>
          <button
            onClick={() => copy(k, v)}
            className="ios-row w-full text-left transition hover:opacity-80"
          >
            <span className="text-footnote">{labelMap[k] || k}</span>
            <span className="flex items-center gap-2 text-body">
              <span className="truncate max-w-[220px] text-right">{v}</span>
              {method.tipo !== 'efectivo' && (
                <span className="text-[11px] font-semibold text-gold">
                  {copied === k ? '✓' : 'Copiar'}
                </span>
              )}
            </span>
          </button>
          {i < fields.length - 1 && <div className="ios-divider" />}
        </div>
      ))}
    </div>
  );
}
