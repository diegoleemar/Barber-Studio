import type { PaymentType } from '@/lib/types';

type IconProps = { className?: string };

export function PagoMovilIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="6" y="2" width="12" height="20" rx="3" />
      <path strokeLinecap="round" d="M9 5h6M10 19h4" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.5 10.5l1.2 1.2 2.3-2.3M9.5 14.5l1.2 1.2 2.3-2.3"
      />
    </svg>
  );
}

export function TransferenciaIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 10l9-6 9 6M5 10v9a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1v-9"
      />
    </svg>
  );
}

export function EfectivoIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="3" />
      <path strokeLinecap="round" d="M6 9.5h.01M18 14.5h.01" />
    </svg>
  );
}

export const PaymentIcon = ({
  tipo,
  className
}: {
  tipo: PaymentType;
  className?: string;
}) => {
  if (tipo === 'pago_movil') return <PagoMovilIcon className={className} />;
  if (tipo === 'transferencia') return <TransferenciaIcon className={className} />;
  return <EfectivoIcon className={className} />;
};
