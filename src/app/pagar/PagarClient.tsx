'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2, Upload, ArrowLeft, Star, Smartphone, Landmark, Shield } from 'lucide-react';
import Link from 'next/link';
import type { Profile, PaymentRequest, PlatformConfig } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

const ACCENT = '#d2ff00';

interface BillingOption {
  months: number;
  total: number;
  badge?: string;
  popular?: boolean;
}

const PLANS = [
  {
    id: 'individual' as const, name: 'Plan Emprendedor', monthly: 10, desc: 'Para profesionales independientes',
    billing: [
      { months: 1, total: 10 } as BillingOption,
      { months: 2, total: 15, badge: '50% 2do mes' } as BillingOption,
      { months: 6, total: 48, badge: '20% desc' } as BillingOption,
      { months: 12, total: 84, badge: '30% desc', popular: true } as BillingOption,
    ],
  },
  {
    id: 'business' as const, name: 'Plan Negocio', monthly: 30, desc: 'Para negocios con equipo armado',
    billing: [
      { months: 1, total: 30 } as BillingOption,
      { months: 2, total: 45, badge: '50% 2do mes' } as BillingOption,
      { months: 6, total: 144, badge: '20% desc' } as BillingOption,
      { months: 12, total: 252, badge: '30% desc', popular: true } as BillingOption,
    ],
  },
];

const METODOS = [
  { id: 'pago_movil' as const, label: 'Pago Móvil', icon: Smartphone },
  { id: 'transferencia' as const, label: 'Transferencia', icon: Landmark },
  { id: 'binancepay' as const, label: 'BinancePay', icon: Shield },
];

export default function PagarClient({
  profile, config, requests,
  defaultPlan, defaultMonths,
}: {
  profile: Profile; config: PlatformConfig | null; requests: PaymentRequest[];
  defaultPlan?: 'individual' | 'business'; defaultMonths?: number;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [plan, setPlan] = useState<'individual' | 'business' | null>(defaultPlan || null);
  const [billingMonths, setBillingMonths] = useState<number>(defaultMonths || 1);
  const [metodo, setMetodo] = useState<'pago_movil' | 'transferencia' | 'binancepay' | null>(null);
  const [referencia, setReferencia] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const pendingRequest = requests.find(r => r.status === 'pending');
  const selectedPlan = PLANS.find(p => p.id === plan);
  const selectedBilling = selectedPlan?.billing.find(b => b.months === billingMonths);
  const totalMonto = selectedBilling?.total || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!plan) { setError('Por favor, selecciona un plan para continuar.'); return; }
    if (!metodo) { setError('Selecciona el método de pago'); return; }
    if (!referencia) { setError('Por favor, ingresa el número de referencia.'); return; }

    setSubmitting(true);
    let comprobante_url: string | null = null;

    if (file) {
      setUploading(true);
      const ext = file.name.split('.').pop();
      const fileName = `pagos/${profile.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('comprobantes').upload(fileName, file);
      if (uploadError) { setError('Error al subir la captura de pago'); setSubmitting(false); setUploading(false); return; }
      const { data: { publicUrl } } = supabase.storage.from('comprobantes').getPublicUrl(fileName);
      comprobante_url = publicUrl;
      setUploading(false);
    }

    const { error: insertError } = await supabase.from('payment_requests').insert({
      profile_id: profile.id,
      plan,
      billing_months: billingMonths,
      metodo,
      monto: totalMonto,
      referencia,
      comprobante_url,
    });

    if (insertError) { setError(insertError.message); setSubmitting(false); return; }
    setSuccess(true);
    setSubmitting(false);
  };

  if (success || pendingRequest) {
    const req = pendingRequest || requests[0];
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center px-6 bg-[#FAF9F6]">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#d2ff00]/25 border border-[#d2ff00]/40 shadow-sm">
            <Check className="h-8 w-8 text-neutral-900" />
          </div>
          <h1 className="text-[22px] font-extrabold text-[#09090b]">¡Reporte enviado!</h1>
          <p className="mt-2 text-[14px] text-neutral-600">Ya recibimos tu reporte. El administrador revisará la referencia y te activará la cuenta al pelo, sin rollos.</p>
          <p className="mt-6 text-[13px] text-neutral-400 font-bold uppercase">Plan: {req?.plan === 'individual' ? 'Emprendedor' : 'Negocio'} · {req?.billing_months || 1} {req?.billing_months === 1 ? 'mes' : 'meses'}</p>
          <p className="text-[13px] text-neutral-400 font-bold">Estado: <span className="text-amber-600">Esperando revisión</span></p>
          <Link href="/" className="mt-8 inline-flex items-center gap-2 text-[14px] font-bold text-neutral-800 hover:text-black">
            <ArrowLeft className="h-4 w-4" /> Volver al inicio
          </Link>
        </div>
      </main>
    );
  }

  const showPagoMovil = config?.pago_movil?.telefono;
  const showTransferencia = config?.transferencia?.cuenta;
  const showBinance = config?.binancepay?.correo;

  return (
    <main className="relative min-h-screen bg-white text-left">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Link href="/" className="inline-flex items-center gap-1.5 text-[13px] text-neutral-400 hover:text-neutral-600 transition mb-2 font-bold uppercase tracking-wider">
          <ArrowLeft className="h-4 w-4" /> Volver al inicio
        </Link>

        <h1 className="text-[22px] font-extrabold text-[#09090b] mt-2">Activa tu plan de una</h1>
        <p className="mt-1 text-[14px] text-neutral-600">Selecciona un plan y transfiere el monto para habilitar tu cuenta.</p>

        <div className="mt-8 grid md:grid-cols-2 gap-4">
          {PLANS.map((p) => {
            const isSelected = plan === p.id;
            return (
              <button key={p.id} onClick={() => { setPlan(p.id); setBillingMonths(1); }}
                className={`relative rounded-2xl p-5 text-left transition-all duration-200 bg-white ${
                  isSelected ? 'border-2 border-[#d2ff00] shadow-md' : 'border border-neutral-200 hover:shadow-sm'
                }`}
              >
                <div className="flex items-baseline gap-1">
                  <span className="text-[13px] text-neutral-400 font-bold">$</span>
                  <span className="text-[2rem] font-extrabold text-neutral-900">{p.monthly}</span>
                  <span className="text-[13px] text-neutral-400 font-bold">/mes</span>
                </div>
                <h3 className="mt-1 text-[16px] font-extrabold text-neutral-950">{p.name}</h3>
                <p className="mt-0.5 text-[13px] text-neutral-500 leading-normal">{p.desc}</p>
                {isSelected && <div className="mt-3 flex items-center gap-1.5 text-[12px] text-black font-bold bg-[#d2ff00]/25 px-2 py-0.5 rounded border border-[#d2ff00]/40 w-max"><Check className="h-3.5 w-3.5" /> Seleccionado</div>}
              </button>
            );
          })}
        </div>

        {plan && (
          <>
            <div className="mt-6">
              <p className="text-[13px] font-bold text-neutral-500 mb-2">Cada cuánto quieres pagar:</p>
              <div className="grid grid-cols-4 gap-2">
                {selectedPlan?.billing.map((b) => {
                  const isSelected = billingMonths === b.months;
                  const perMonth = (b.total / b.months).toFixed(0);
                  return (
                    <button
                      key={b.months}
                      type="button"
                      onClick={() => setBillingMonths(b.months)}
                      className={`relative rounded-xl p-3 text-center transition-all border ${
                        isSelected ? 'border-[#d2ff00] bg-[#d2ff00]/5 shadow-sm' : 'border-neutral-200 bg-white hover:border-[#d2ff00]/40'
                      }`}
                    >
                      {b.badge && (
                        <span className="absolute -top-1.5 -right-1.5 inline-flex items-center rounded-full bg-[#d2ff00] border border-black/10 px-1.5 py-0.5 text-[7px] font-bold text-black shadow-sm">
                          {b.badge}
                        </span>
                      )}
                      <p className="text-[14px] font-extrabold text-neutral-900">${b.total}</p>
                      <p className="text-[9px] text-neutral-400 font-medium">${perMonth}/mes</p>
                      <p className="text-[9px] text-neutral-400 font-bold">{b.months} {b.months === 1 ? 'mes' : 'meses'}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <h2 className="mt-8 text-[18px] font-extrabold text-[#09090b]">Cómo pagar</h2>
            <p className="mt-1 text-[13px] text-neutral-500">Elige el método que te sirva y transfiere el monto exacto.</p>

            {showPagoMovil && (
              <div className={`mt-4 rounded-2xl border p-5 transition-all bg-white ${metodo === 'pago_movil' ? 'border-[#d2ff00] bg-[#d2ff00]/5 shadow-sm' : 'border-neutral-200'}`}>
                <button onClick={() => setMetodo('pago_movil')} className="flex items-center justify-between w-full text-left">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-5 w-5 text-neutral-800" />
                    <div><p className="text-[15px] font-bold text-neutral-900">Pago Móvil</p><p className="text-[12px] text-neutral-400 font-medium">{config?.pago_movil?.banco} · {config?.pago_movil?.telefono}</p></div>
                  </div>
                  <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${metodo === 'pago_movil' ? 'border-[#d2ff00] bg-[#d2ff00]' : 'border-neutral-300'}`}>
                    {metodo === 'pago_movil' && <div className="h-2 w-2 rounded-full bg-black" />}
                  </div>
                </button>
                {metodo === 'pago_movil' && (
                  <div className="mt-3 pt-3 border-t border-neutral-100 text-[13px] text-[#52525b] space-y-1 font-medium">
                    <p><span className="text-neutral-400">Banco:</span> {config?.pago_movil?.banco}</p>
                    <p><span className="text-neutral-400">Teléfono:</span> {config?.pago_movil?.telefono}</p>
                    <p><span className="text-neutral-400">Titular:</span> {config?.pago_movil?.titular}</p>
                    <p className="mt-2 font-bold text-black bg-[#d2ff00]/30 border border-[#d2ff00]/40 px-2 py-1 rounded w-max">Monto a transferir: ${totalMonto}.00 USD</p>
                  </div>
                )}
              </div>
            )}

            {showTransferencia && (
              <div className={`mt-3 rounded-2xl border p-5 transition-all bg-white ${metodo === 'transferencia' ? 'border-[#d2ff00] bg-[#d2ff00]/5 shadow-sm' : 'border-neutral-200'}`}>
                <button onClick={() => setMetodo('transferencia')} className="flex items-center justify-between w-full text-left">
                  <div className="flex items-center gap-3">
                    <Landmark className="h-5 w-5 text-neutral-800" />
                    <div><p className="text-[15px] font-bold text-neutral-900">Transferencia Bancaria</p><p className="text-[12px] text-neutral-400 font-medium">{config?.transferencia?.banco} · {config?.transferencia?.cuenta}</p></div>
                  </div>
                  <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${metodo === 'transferencia' ? 'border-[#d2ff00] bg-[#d2ff00]' : 'border-neutral-300'}`}>
                    {metodo === 'transferencia' && <div className="h-2 w-2 rounded-full bg-black" />}
                  </div>
                </button>
                {metodo === 'transferencia' && (
                  <div className="mt-3 pt-3 border-t border-neutral-100 text-[13px] text-[#52525b] space-y-1 font-medium">
                    <p><span className="text-neutral-400">Banco:</span> {config?.transferencia?.banco}</p>
                    <p><span className="text-neutral-400">Cuenta:</span> {config?.transferencia?.cuenta}</p>
                    <p><span className="text-neutral-400">Titular:</span> {config?.transferencia?.titular}</p>
                    <p className="mt-2 font-bold text-black bg-[#d2ff00]/30 border border-[#d2ff00]/40 px-2 py-1 rounded w-max">Monto a transferir: ${totalMonto}.00 USD</p>
                  </div>
                )}
              </div>
            )}

            {showBinance && (
              <div className={`mt-3 rounded-2xl border p-5 transition-all bg-white ${metodo === 'binancepay' ? 'border-[#d2ff00] bg-[#d2ff00]/5 shadow-sm' : 'border-neutral-200'}`}>
                <button onClick={() => setMetodo('binancepay')} className="flex items-center justify-between w-full text-left">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-neutral-800" />
                    <div><p className="text-[15px] font-bold text-neutral-900">Binance Pay</p><p className="text-[12px] text-neutral-400 font-medium">{config?.binancepay?.correo}</p></div>
                  </div>
                  <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${metodo === 'binancepay' ? 'border-[#d2ff00] bg-[#d2ff00]' : 'border-neutral-300'}`}>
                    {metodo === 'binancepay' && <div className="h-2 w-2 rounded-full bg-black" />}
                  </div>
                </button>
                {metodo === 'binancepay' && (
                  <div className="mt-3 pt-3 border-t border-neutral-100 text-[13px] text-[#52525b] space-y-1 font-medium">
                    <p><span className="text-neutral-400">Correo:</span> {config?.binancepay?.correo}</p>
                    <p><span className="text-neutral-400">ID Usuario:</span> {config?.binancepay?.id_usuario}</p>
                    <p className="mt-2 font-bold text-black bg-[#d2ff00]/30 border border-[#d2ff00]/40 px-2 py-1 rounded w-max">Monto a transferir: ${totalMonto}.00 USD</p>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="text-[12px] font-bold text-[#52525b] mb-1.5 block">Número de referencia de la transferencia</label>
                <input type="text" value={referencia} onChange={(e) => setReferencia(e.target.value)} placeholder="Ej: 123456789"
                  className="input" required />
              </div>
              <div>
                <label className="text-[12px] font-bold text-[#52525b] mb-1.5 block">Sube una captura del pago (opcional)</label>
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 bg-white px-4 py-6 text-[13px] text-neutral-400 font-bold hover:border-neutral-400 transition-all">
                  <Upload className="h-5 w-5" /> {file ? file.name : 'Toca para subir la captura'}
                </button>
                <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </div>

              {error && <p className="text-center text-[13px] text-red-600 font-bold">{error}</p>}

              <button type="submit" disabled={submitting}
                className="inline-flex w-full h-[52px] items-center justify-center gap-2 rounded-xl text-[15px] font-bold text-black bg-[#d2ff00] border border-black/5 shadow-md hover:brightness-105 disabled:opacity-40 transition-all">
                {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Enviando reporte&hellip;</> : `Enviar reporte de pago — $${totalMonto}.00`}
              </button>

              <p className="text-center text-[12px] text-neutral-400 font-medium">El administrador verificará tu pago volando y te activará la cuenta.</p>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
