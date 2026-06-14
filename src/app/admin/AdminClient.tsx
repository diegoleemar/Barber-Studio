'use client';

import { useState } from 'react';
import { Users, CreditCard, Settings, Check, X, Loader2, Search, Smartphone, Landmark, Shield, ExternalLink } from 'lucide-react';
import type { Profile, Profession, PaymentRequest, PlatformConfig } from '@/lib/types';
import { activateUser, deactivateUser, verifyPayment, rejectPayment, updatePlatformConfig } from './actions';

type Tab = 'usuarios' | 'pagos' | 'config';

export default function AdminClient({
  profiles, requests, config
}: {
  profiles: (Profile & { profession?: Profession })[];
  requests: (PaymentRequest & { profile?: Profile })[];
  config: PlatformConfig | null;
}) {
  const [tab, setTab] = useState<Tab>('pagos');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<PaymentRequest | null>(null);
  const [rejectNotas, setRejectNotas] = useState('');

  const [editingConfig, setEditingConfig] = useState(false);
  const [cfg, setCfg] = useState({
    pago_movil: config?.pago_movil || { banco: '', telefono: '', titular: '' },
    transferencia: config?.transferencia || { banco: '', cuenta: '', titular: '' },
    binancepay: config?.binancepay || { correo: '', id_usuario: '' },
  });

  const filteredProfiles = profiles.filter(p => {
    if (filter === 'active' && p.subscription_status !== 'active') return false;
    if (filter === 'inactive' && p.subscription_status !== 'inactive') return false;
    if (search && !p.business_name.toLowerCase().includes(search.toLowerCase()) && !p.username.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const verifiedRequests = requests.filter(r => r.status === 'verified');
  const rejectedRequests = requests.filter(r => r.status === 'rejected');

  const handleActivate = async (id: string, plan: string) => {
    setLoadingId(id);
    try { await activateUser(id, plan); } catch (e) { console.error(e); }
    setLoadingId(null);
  };

  const handleDeactivate = async (id: string) => {
    setLoadingId(id);
    try { await deactivateUser(id); } catch (e) { console.error(e); }
    setLoadingId(null);
  };

  const handleVerify = async (req: PaymentRequest & { profile?: Profile }) => {
    setLoadingId(req.id);
    try { await verifyPayment(req.id, req.profile_id, req.plan); } catch (e) { console.error(e); }
    setLoadingId(null);
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setLoadingId(rejectModal.id);
    try { await rejectPayment(rejectModal.id, rejectNotas); } catch (e) { console.error(e); }
    setRejectModal(null);
    setRejectNotas('');
    setLoadingId(null);
  };

  const handleSaveConfig = async () => {
    setLoadingId('config');
    try { await updatePlatformConfig(cfg); setEditingConfig(false); } catch (e) { console.error(e); }
    setLoadingId(null);
  };

  const badge = (status: string) => {
    if (status === 'active') return <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">Activo</span>;
    if (status === 'inactive') return <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-400">Inactivo</span>;
    if (status === 'expired') return <span className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-[11px] font-medium text-red-400">Vencido</span>;
    if (status === 'pending') return <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-400">Pendiente</span>;
    if (status === 'verified') return <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">Verificado</span>;
    if (status === 'rejected') return <span className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-[11px] font-medium text-red-400">Rechazado</span>;
    return null;
  };

  const planLabel = (plan: string | null) => {
    if (plan === 'individual') return 'Individual';
    if (plan === 'business') return 'Business';
    return '-';
  };

  const TABS: { id: Tab; label: string; icon: typeof Users; count?: number }[] = [
    { id: 'pagos', label: 'Pagos pendientes', icon: CreditCard, count: pendingRequests.length },
    { id: 'usuarios', label: 'Usuarios', icon: Users },
    { id: 'config', label: 'Config. pagos', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-base-950 text-white">
      <header className="border-b border-[#222] bg-black/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-[18px] font-semibold tracking-tight">Admin Panel — GoClient</h1>
            <span className="text-[11px] text-label-tertiary rounded-md border border-[#222] px-2 py-1">LOCAL ONLY</span>
          </div>
          <div className="flex gap-1 mt-3">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-all ${
                  tab === t.id ? 'bg-brand/10 text-brand' : 'text-label-tertiary hover:text-label-primary hover:bg-base-800'
                }`}>
                <t.icon className="h-3.5 w-3.5" />
                {t.label}
                {t.count !== undefined && t.count > 0 && (
                  <span className="ml-1 rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-bold text-white">{t.count}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6">

        {tab === 'pagos' && (
          <div className="space-y-4">
            <h2 className="text-[16px] font-semibold">Solicitudes de pago</h2>
            {pendingRequests.length === 0 && (
              <div className="rounded-2xl border border-[#222] bg-black p-10 text-center">
                <CreditCard className="mx-auto h-10 w-10 text-label-quaternary" />
                <p className="mt-3 text-[14px] text-label-tertiary">No hay solicitudes pendientes</p>
              </div>
            )}
            {pendingRequests.map(req => {
              const profile = req.profile || profiles.find(p => p.id === req.profile_id);
              return (
                <div key={req.id} className="rounded-2xl border border-amber-500/20 bg-black p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{profile?.business_name || 'Desconocido'}</p>
                        {badge(req.status)}
                      </div>
                      <p className="mt-1 text-[13px] text-label-tertiary">
                        @{profile?.username} · {profile?.profession?.name || '-'} · Plan {planLabel(req.plan)} · ${req.monto}
                      </p>
                      <p className="text-[12px] text-label-tertiary">
                        {req.metodo === 'pago_movil' ? 'Pago Móvil' : req.metodo === 'transferencia' ? 'Transferencia' : 'BinancePay'}
                        {req.referencia ? ` · Ref: ${req.referencia}` : ''}
                      </p>
                      <p className="text-[11px] text-label-quaternary mt-1">
                        {new Date(req.created_at).toLocaleString('es-VE')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {req.comprobante_url && (
                        <a href={req.comprobante_url} target="_blank" rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#222] bg-base-800 px-3 py-1.5 text-[12px] font-medium hover:bg-base-700 transition">
                          <ExternalLink className="h-3.5 w-3.5" /> Ver comprobante
                        </a>
                      )}
                      <button onClick={() => handleVerify(req)} disabled={loadingId === req.id}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-emerald-400 transition disabled:opacity-50">
                        {loadingId === req.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                        Activar
                      </button>
                      <button onClick={() => setRejectModal(req)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#333] px-3 py-1.5 text-[12px] font-medium text-label-tertiary hover:border-red-400 hover:text-red-400 transition">
                        <X className="h-3.5 w-3.5" /> Rechazar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {verifiedRequests.length > 0 && (
              <>
                <h3 className="mt-8 text-[15px] font-semibold text-label-tertiary">Historial verificado</h3>
                {verifiedRequests.slice(0, 10).map(req => {
                  const profile = req.profile || profiles.find(p => p.id === req.profile_id);
                  return (
                    <div key={req.id} className="rounded-2xl border border-[#222] bg-black p-4 opacity-70">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[14px] font-medium">{profile?.business_name || 'Desconocido'} <span className="text-label-tertiary">· {planLabel(req.plan)}</span></p>
                          <p className="text-[12px] text-label-tertiary">{new Date(req.created_at).toLocaleDateString('es-VE')}</p>
                        </div>
                        {badge(req.status)}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}

        {tab === 'usuarios' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="flex gap-2">
                {(['all', 'active', 'inactive'] as const).map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`rounded-lg px-3 py-1.5 text-[12px] font-medium transition-all ${
                      filter === f ? 'bg-brand text-white' : 'bg-base-800 text-label-tertiary hover:text-label-primary'
                    }`}>
                    {f === 'all' ? 'Todos' : f === 'active' ? 'Activos' : 'Inactivos'} ({f === 'all' ? profiles.length : f === 'active' ? profiles.filter(p => p.subscription_status === 'active').length : profiles.filter(p => p.subscription_status !== 'active').length})
                  </button>
                ))}
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-label-quaternary" />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar usuario..." className="input !pl-9 !h-9 !text-[13px]" />
              </div>
            </div>

            {filteredProfiles.length === 0 && (
              <div className="rounded-2xl border border-[#222] bg-black p-10 text-center">
                <Users className="mx-auto h-10 w-10 text-label-quaternary" />
                <p className="mt-3 text-[14px] text-label-tertiary">No se encontraron usuarios</p>
              </div>
            )}

            <div className="space-y-2">
              {filteredProfiles.map(p => (
                <div key={p.id} className="rounded-2xl border border-[#222] bg-black p-4 hover:border-[#333] transition">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-base-700 text-[14px] font-semibold">
                        {p.business_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-[14px]">{p.business_name}</p>
                        <p className="text-[12px] text-label-tertiary">@{p.username} · {p.profession?.name || '-'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        {badge(p.subscription_status)}
                        {p.subscription_plan && <p className="text-[11px] text-label-tertiary mt-0.5">{planLabel(p.subscription_plan)}</p>}
                      </div>
                      {p.subscription_status !== 'active' ? (
                        <div className="flex gap-1">
                          <button onClick={() => handleActivate(p.id, 'individual')} disabled={loadingId === p.id}
                            className="rounded-lg bg-brand/10 px-2.5 py-1.5 text-[11px] font-medium text-brand hover:bg-brand/20 transition disabled:opacity-50">
                            {loadingId === p.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Individual'}
                          </button>
                          <button onClick={() => handleActivate(p.id, 'business')} disabled={loadingId === p.id}
                            className="rounded-lg bg-brand/10 px-2.5 py-1.5 text-[11px] font-medium text-brand hover:bg-brand/20 transition disabled:opacity-50">
                            {loadingId === p.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Business'}
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => handleDeactivate(p.id)} disabled={loadingId === p.id}
                          className="rounded-lg border border-red-400/20 px-2.5 py-1.5 text-[11px] font-medium text-red-400 hover:bg-red-500/10 transition disabled:opacity-50">
                          {loadingId === p.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Desactivar'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'config' && (
          <div className="max-w-2xl space-y-6">
            <h2 className="text-[16px] font-semibold">Métodos de pago de la plataforma</h2>
            <p className="text-[13px] text-label-tertiary">Estos datos se muestran a los usuarios en la página de pago.</p>

            <div className="rounded-2xl border border-[#222] bg-black p-5">
              <div className="flex items-center gap-3 mb-4">
                <Smartphone className="h-5 w-5 text-brand" />
                <h3 className="font-semibold text-[15px]">Pago Móvil</h3>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <div><label className="text-[11px] text-label-tertiary block mb-1">Banco</label>
                  <input type="text" value={cfg.pago_movil.banco} onChange={e => setCfg({...cfg, pago_movil: {...cfg.pago_movil, banco: e.target.value}})}
                    className="input !h-9 !text-[13px]" disabled={!editingConfig} placeholder="Banesco" /></div>
                <div><label className="text-[11px] text-label-tertiary block mb-1">Teléfono</label>
                  <input type="text" value={cfg.pago_movil.telefono} onChange={e => setCfg({...cfg, pago_movil: {...cfg.pago_movil, telefono: e.target.value}})}
                    className="input !h-9 !text-[13px]" disabled={!editingConfig} placeholder="0412-1234567" /></div>
                <div><label className="text-[11px] text-label-tertiary block mb-1">Titular</label>
                  <input type="text" value={cfg.pago_movil.titular} onChange={e => setCfg({...cfg, pago_movil: {...cfg.pago_movil, titular: e.target.value}})}
                    className="input !h-9 !text-[13px]" disabled={!editingConfig} placeholder="GoClient" /></div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#222] bg-black p-5">
              <div className="flex items-center gap-3 mb-4">
                <Landmark className="h-5 w-5 text-brand" />
                <h3 className="font-semibold text-[15px]">Transferencia</h3>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <div><label className="text-[11px] text-label-tertiary block mb-1">Banco</label>
                  <input type="text" value={cfg.transferencia.banco} onChange={e => setCfg({...cfg, transferencia: {...cfg.transferencia, banco: e.target.value}})}
                    className="input !h-9 !text-[13px]" disabled={!editingConfig} placeholder="Banesco" /></div>
                <div><label className="text-[11px] text-label-tertiary block mb-1">Cuenta</label>
                  <input type="text" value={cfg.transferencia.cuenta} onChange={e => setCfg({...cfg, transferencia: {...cfg.transferencia, cuenta: e.target.value}})}
                    className="input !h-9 !text-[13px]" disabled={!editingConfig} placeholder="0102-xxxx-xx-xxxx" /></div>
                <div><label className="text-[11px] text-label-tertiary block mb-1">Titular</label>
                  <input type="text" value={cfg.transferencia.titular} onChange={e => setCfg({...cfg, transferencia: {...cfg.transferencia, titular: e.target.value}})}
                    className="input !h-9 !text-[13px]" disabled={!editingConfig} placeholder="GoClient" /></div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#222] bg-black p-5">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-5 w-5 text-brand" />
                <h3 className="font-semibold text-[15px]">BinancePay</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div><label className="text-[11px] text-label-tertiary block mb-1">Correo</label>
                  <input type="text" value={cfg.binancepay.correo} onChange={e => setCfg({...cfg, binancepay: {...cfg.binancepay, correo: e.target.value}})}
                    className="input !h-9 !text-[13px]" disabled={!editingConfig} placeholder="admin@goclient.app" /></div>
                <div><label className="text-[11px] text-label-tertiary block mb-1">ID Usuario</label>
                  <input type="text" value={cfg.binancepay.id_usuario} onChange={e => setCfg({...cfg, binancepay: {...cfg.binancepay, id_usuario: e.target.value}})}
                    className="input !h-9 !text-[13px]" disabled={!editingConfig} placeholder="@goclient" /></div>
              </div>
            </div>

            <div className="flex gap-3">
              {editingConfig ? (
                <>
                  <button onClick={handleSaveConfig} disabled={loadingId === 'config'}
                    className="btn-primary !h-10 !text-[13px]">
                    {loadingId === 'config' ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Guardando&hellip;</> : 'Guardar cambios'}
                  </button>
                  <button onClick={() => { setEditingConfig(false); setCfg({ pago_movil: config?.pago_movil || { banco: '', telefono: '', titular: '' }, transferencia: config?.transferencia || { banco: '', cuenta: '', titular: '' }, binancepay: config?.binancepay || { correo: '', id_usuario: '' } }); }}
                    className="rounded-lg border border-[#333] px-4 py-2 text-[13px] font-medium text-label-tertiary hover:text-label-primary transition">
                    Cancelar
                  </button>
                </>
              ) : (
                <button onClick={() => setEditingConfig(true)}
                  className="btn-primary !h-10 !text-[13px]">
                  Editar datos de pago
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#222] bg-base-900 p-6">
            <h3 className="font-semibold">Rechazar solicitud</h3>
            <p className="mt-1 text-[13px] text-label-tertiary">Razón del rechazo (opcional):</p>
            <textarea value={rejectNotas} onChange={(e) => setRejectNotas(e.target.value)} rows={3}
              className="input mt-3 !h-auto !min-h-[80px] resize-none" placeholder="Ej: Comprobante ilegible, monto incorrecto..." />
            <div className="mt-4 flex gap-3">
              <button onClick={handleReject} disabled={loadingId === rejectModal.id}
                className="flex-1 rounded-lg bg-red-500 py-2 text-[13px] font-semibold text-white hover:bg-red-400 transition disabled:opacity-50">
                {loadingId === rejectModal.id ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : 'Rechazar'}
              </button>
              <button onClick={() => { setRejectModal(null); setRejectNotas(''); }}
                className="flex-1 rounded-lg border border-[#333] py-2 text-[13px] font-medium text-label-tertiary hover:text-label-primary transition">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
