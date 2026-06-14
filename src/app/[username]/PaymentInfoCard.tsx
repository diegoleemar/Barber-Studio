'use client';

import { useState } from 'react';
import type { PaymentMethod } from '@/lib/types';
import { PaymentIcon } from '@/components/icons/PaymentIcons';
import { Check, Copy } from 'lucide-react';

const TITLES: Record<PaymentMethod['tipo'], string> = {
  pago_movil: 'Pago Móvil',
  transferencia: 'Transferencia',
  efectivo: 'Efectivo / Divisas',
  binance: 'BinancePay',
  paypal: 'PayPal',
  zelle: 'Zelle'
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
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3 pb-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
          <PaymentIcon tipo={method.tipo} className="h-5 w-5" />
        </span>
        <h4 className="text-[15px] font-semibold text-label-primary">{TITLES[method.tipo]}</h4>
      </div>
      <div className="mb-2 h-px bg-gray-100" />
      {fields.map(([k, v], i) => (
        <div key={k}>
          <button onClick={() => copy(k, v)}
            className="flex w-full items-center justify-between py-2 text-left transition hover:opacity-80">
            <span className="text-[13px] text-label-tertiary">{labelMap[k] || k}</span>
            <span className="flex items-center gap-2 text-[14px] text-label-primary">
              <span className="truncate max-w-[200px] text-right">{v}</span>
              {method.tipo !== 'efectivo' && (
                <span className="flex h-6 w-6 items-center justify-center rounded-md text-brand">
                  {copied === k ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                </span>
              )}
            </span>
          </button>
          {i < fields.length - 1 && <div className="h-px bg-gray-100" />}
        </div>
      ))}
    </div>
  );
}
