'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2, Upload, ArrowLeft, Star, Smartphone, Landmark, Shield } from 'lucide-react';
import Link from 'next/link';
import type { Barber, PaymentRequest, PlatformConfig } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

const PLANS = [
  {
    id: 'barbero' as const, name: 'Barbero', price: '10', desc: 'Para barberos independientes',
    features: ['Perfil profesional', 'Agenda en tiempo real', 'Link personalizado', 'Servicios ilimitados', 'Horarios editables', 'Pago Móvil, transferencia y efectivo', 'Notificaciones de reserva']
  },
  {
    id: 'barberia' as const, name: 'Barbería', price: '30', desc: 'Para barberías con 3+ barberos',
    features: ['Todo lo del plan Barbero', 'Links para cada barbero', 'Dashboard general', 'Ajuste de % por barbero', 'Horarios por barbero', 'Gestión múltiple servicios', 'Estadísticas y reportes']
  }
];

const METODOS = [
  { id: 'pago_movil' as const, label: 'Pago Móvil', icon: Smartphone },
  { id: 'transferencia' as const, label: 'Transferencia', icon: Landmark },
  { id: 'binancepay' as const, label: 'BinancePay', icon: Shield },
];

export default function PagarClient({ barber, config, requests }: { barber: Barber; config: PlatformConfig | null; requests: PaymentRequest[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [plan, setPlan] = useState<'barbero' | 'barberia' | null>(null);
  const [metodo, setMetodo] = useState<'pago_movil' | 'transferencia' | 'binancepay' | null>(null);
  const [referencia, setReferencia] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const pendingRequest = requests.find(r => r.status === 'pending');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!plan) { setError('Selecciona un plan'); return; }
    if (!metodo) { setError('Selecciona un método de pago'); return; }
    if (!referencia) { setError('Ingresa el número de referencia'); return; }

    setSubmitting(true);
    let comprobante_url: string | null = null;

    if (file) {
      setUploading(true);
      const ext = file.name.split('.').pop();
      const fileName = `pagos/${barber.id}/${Date.now()}.${ext}`;
      const { error: uploadError, data } = await supabase.storage.from('comprobantes').upload(fileName, file);
      if (uploadError) { setError('Error al subir el comprobante. Intenta de nuevo.'); setSubmitting(false); setUploading(false); return; }
      const { data: { publicUrl } } = supabase.storage.from('comprobantes').getPublicUrl(fileName);
      comprobante_url = publicUrl;
      setUploading(false);
    }

    const monto = plan === 'barbero' ? 10 : 30;
    const { error: insertError } = await supabase.from('payment_requests').insert({
      barber_id: barber.id,
      plan,
      metodo,
      monto,
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
      <main className="relative flex min-h-screen flex-col items-center justify-center px-6 bg-base-950">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
            <Check className="h-8 w-8 text-emerald-400" />
          </div>
          <h1 className="text-h1">Solicitud enviada</h1>
          <p className="mt-2 text-body">Hemos recibido tu solicitud de activación. El administrador la revisará y activará tu cuenta pronto.</p>
          <p className="mt-6 text-[13px] text-label-tertiary">Plan: {req?.plan === 'barbero' ? 'Barbero ($10/mes)' : 'Barbería ($30/mes)'}</p>
          <p className="text-[13px] text-label-tertiary">Estado: <span className="text-amber-400 font-medium">Pendiente de verificación</span></p>
          <Link href="/" className="mt-8 inline-flex items-center gap-2 text-[14px] text-brand hover:underline">
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
    <main className="relative min-h-screen bg-base-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-brand/10 blur-[160px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl px-4 py-10">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-[13px] text-label-tertiary hover:text-label-primary transition mb-8">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>

        <h1 className="text-h1">Activa tu suscripción</h1>
        <p className="mt-2 text-body">Selecciona un plan y realiza el pago para activar tu cuenta.</p>

        {/* Plans */}
        <div className="mt-8 grid md:grid-cols-2 gap-4">
          {PLANS.map((p) => (
            <button key={p.id} onClick={() => setPlan(p.id)}
              className={`relative rounded-2xl p-5 text-left transition-all duration-200 ${
                plan === p.id
                  ? 'bg-gradient-to-b from-brand/[0.03] to-black ring-2 ring-brand/40 shadow-glow-lg'
                  : 'bg-black ring-1 ring-[#222] hover:ring-brand/30'
              }`}>
              <div className="flex items-baseline gap-1">
                <span className="text-[13px] text-label-secondary">$</span>
                <span className="text-[2rem] font-bold text-white">{p.price}</span>
                <span className="text-[13px] text-label-tertiary">/mes</span>
              </div>
              <h3 className="mt-2 text-[17px] font-semibold">{p.name}</h3>
              <p className="mt-0.5 text-[13px] text-label-secondary">{p.desc}</p>
              {plan === p.id && <div className="mt-3 flex items-center gap-1.5 text-[12px] text-brand"><Check className="h-3.5 w-3.5" /> Seleccionado</div>}
            </button>
          ))}
        </div>

        {/* Payment methods */}
        {plan && (
          <>
            <h2 className="mt-10 text-[18px] font-semibold">Método de pago</h2>
            <p className="mt-1 text-[13px] text-label-tertiary">Elige cómo quieres pagar y transfiere el monto exacto.</p>

            {/* Pago Móvil */}
            {showPagoMovil && (
              <div className={`mt-4 rounded-2xl border p-5 transition-all ${metodo === 'pago_movil' ? 'border-brand/40 bg-brand/[0.02] ring-1 ring-brand/20' : 'border-[#222] bg-black'}`}>
                <button onClick={() => setMetodo('pago_movil')} className="flex items-center justify-between w-full text-left">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-5 w-5 text-brand" />
                    <div><p className="text-[15px] font-medium">Pago Móvil</p><p className="text-[12px] text-label-tertiary">{config?.pago_movil?.banco} · {config?.pago_movil?.telefono}</p></div>
                  </div>
                  <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${metodo === 'pago_movil' ? 'border-brand bg-brand' : 'border-[#444]'}`}>
                    {metodo === 'pago_movil' && <div className="h-2 w-2 rounded-full bg-white" />}
                  </div>
                </button>
                {metodo === 'pago_movil' && (
                  <div className="mt-3 pt-3 border-t border-[#222] text-[13px] text-label-secondary space-y-1">
                    <p><span className="text-label-tertiary">Banco:</span> {config?.pago_movil?.banco}</p>
                    <p><span className="text-label-tertiary">Teléfono:</span> {config?.pago_movil?.telefono}</p>
                    <p><span className="text-label-tertiary">Titular:</span> {config?.pago_movil?.titular}</p>
                    <p className="mt-2 text-brand font-medium">Monto a pagar: ${plan === 'barbero' ? '10' : '30'}.00 USD</p>
                  </div>
                )}
              </div>
            )}

            {/* Transferencia */}
            {showTransferencia && (
              <div className={`mt-3 rounded-2xl border p-5 transition-all ${metodo === 'transferencia' ? 'border-brand/40 bg-brand/[0.02] ring-1 ring-brand/20' : 'border-[#222] bg-black'}`}>
                <button onClick={() => setMetodo('transferencia')} className="flex items-center justify-between w-full text-left">
                  <div className="flex items-center gap-3">
                    <Landmark className="h-5 w-5 text-brand" />
                    <div><p className="text-[15px] font-medium">Transferencia</p><p className="text-[12px] text-label-tertiary">{config?.transferencia?.banco} · {config?.transferencia?.cuenta}</p></div>
                  </div>
                  <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${metodo === 'transferencia' ? 'border-brand bg-brand' : 'border-[#444]'}`}>
                    {metodo === 'transferencia' && <div className="h-2 w-2 rounded-full bg-white" />}
                  </div>
                </button>
                {metodo === 'transferencia' && (
                  <div className="mt-3 pt-3 border-t border-[#222] text-[13px] text-label-secondary space-y-1">
                    <p><span className="text-label-tertiary">Banco:</span> {config?.transferencia?.banco}</p>
                    <p><span className="text-label-tertiary">Cuenta:</span> {config?.transferencia?.cuenta}</p>
                    <p><span className="text-label-tertiary">Titular:</span> {config?.transferencia?.titular}</p>
                    <p className="mt-2 text-brand font-medium">Monto a pagar: ${plan === 'barbero' ? '10' : '30'}.00 USD</p>
                  </div>
                )}
              </div>
            )}

            {/* BinancePay */}
            {showBinance && (
              <div className={`mt-3 rounded-2xl border p-5 transition-all ${metodo === 'binancepay' ? 'border-brand/40 bg-brand/[0.02] ring-1 ring-brand/20' : 'border-[#222] bg-black'}`}>
                <button onClick={() => setMetodo('binancepay')} className="flex items-center justify-between w-full text-left">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-brand" />
                    <div><p className="text-[15px] font-medium">BinancePay</p><p className="text-[12px] text-label-tertiary">{config?.binancepay?.correo}</p></div>
                  </div>
                  <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${metodo === 'binancepay' ? 'border-brand bg-brand' : 'border-[#444]'}`}>
                    {metodo === 'binancepay' && <div className="h-2 w-2 rounded-full bg-white" />}
                  </div>
                </button>
                {metodo === 'binancepay' && (
                  <div className="mt-3 pt-3 border-t border-[#222] text-[13px] text-label-secondary space-y-1">
                    <p><span className="text-label-tertiary">Correo:</span> {config?.binancepay?.correo}</p>
                    <p><span className="text-label-tertiary">ID Usuario:</span> {config?.binancepay?.id_usuario}</p>
                    <p className="mt-2 text-brand font-medium">Monto a pagar: ${plan === 'barbero' ? '10' : '30'}.00 USD</p>
                  </div>
                )}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="text-[12px] font-medium text-label-tertiary mb-1.5 block">Número de referencia / ID de transacción</label>
                <input type="text" value={referencia} onChange={(e) => setReferencia(e.target.value)} placeholder="Ej: 1234567890" className="input" required />
              </div>
              <div>
                <label className="text-[12px] font-medium text-label-tertiary mb-1.5 block">Comprobante de pago (opcional)</label>
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#333] bg-black px-4 py-6 text-[13px] text-label-tertiary hover:border-brand/40 hover:text-brand transition-all">
                  <Upload className="h-5 w-5" /> {file ? file.name : 'Sube una captura o PDF'}
                </button>
                <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </div>

              {error && <p className="text-center text-[13px] text-red-400">{error}</p>}

              <button type="submit" disabled={submitting}
                className="btn-primary w-full !h-[52px] !text-[15px] !font-semibold">
                {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Enviando solicitud&hellip;</> : `Enviar solicitud — $${plan === 'barbero' ? '10' : '30'}.00`}
              </button>

              <p className="text-center text-[12px] text-label-tertiary">El administrador verificará tu pago y activará la cuenta.</p>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
