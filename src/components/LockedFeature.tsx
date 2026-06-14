import Link from 'next/link';
import { Lock, Sparkles } from 'lucide-react';

const ORANGE = '#f94b25';

export function LockedFeature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex items-center justify-center px-6 py-20">
      <div className="max-w-sm text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
          <Lock className="h-7 w-7 text-gray-400" />
        </div>
        <h2 className="text-[20px] font-bold text-[#0a0915]">{title} bloqueado</h2>
        <p className="mt-2 text-[14px] text-[#52525a] leading-relaxed">{desc}</p>
        <Link href="/pagar"
          className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl px-6 text-[14px] font-semibold text-white shadow-sm hover:brightness-110 transition-all"
          style={{ backgroundColor: ORANGE }}>
          <Sparkles className="h-4 w-4" /> Activar suscripción
        </Link>
        <p className="mt-4 text-[12px] text-[#a3a3a3]">
          Planes desde <span className="font-semibold text-[#0a0915]">$10/mes</span> · 7 días gratis
        </p>
      </div>
    </div>
  );
}
