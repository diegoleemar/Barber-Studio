'use client';

import { useEffect, useState } from 'react';
import { Download, Smartphone, X, Share2 } from 'lucide-react';

let deferredPrompt: any = null;

export default function PWAInstallButton() {
  const [show, setShow] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ua = navigator.userAgent;
    const iOS = /iphone|ipad|ipod/i.test(ua);
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    const safari = iOS && !standalone;

    if (standalone) {
      setInstalled(true);
      return;
    }

    if (iOS && safari) {
      setIsIOS(true);
      setShow(true);
      return;
    }

    const handlePrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e;
      setShow(true);
    };

    const handleInstalled = () => {
      setInstalled(true);
      setShow(false);
      deferredPrompt = null;
    };

    window.addEventListener('beforeinstallprompt', handlePrompt);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const install = async () => {
    if (isIOS) return;
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    deferredPrompt = null;
    setShow(false);
  };

  if (installed || dismissed || !show) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 w-[90vw] max-w-sm -translate-x-1/2 rounded-2xl border border-base-border bg-base-900/90 p-4 shadow-elevated backdrop-blur-xl">
      <button onClick={() => setDismissed(true)} className="absolute right-2 top-2 btn-icon !h-7 !w-7">
        <X className="h-3.5 w-3.5" />
      </button>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10">
          <Smartphone className="h-5 w-5 text-brand" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold text-label-primary">Instala Barber Studio</p>
          <p className="mt-0.5 text-[12px] text-label-tertiary">
            {isIOS ? 'Toca el icono Compartir y luego Añadir a Pantalla de Inicio' : 'Accede rápido desde tu pantalla de inicio'}
          </p>
        </div>
        {isIOS ? (
          <div className="flex h-9 shrink-0 items-center gap-1 rounded-lg bg-brand px-3 text-[12px] font-medium text-white">
            <Share2 className="h-3.5 w-3.5" />
          </div>
        ) : (
          <button onClick={install} className="btn-primary h-9 shrink-0 px-4 text-[13px]">
            <Download className="h-3.5 w-3.5" /> Instalar
          </button>
        )}
      </div>
    </div>
  );
}
