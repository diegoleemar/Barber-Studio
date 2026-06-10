import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-ink-800">
        <svg viewBox="0 0 24 24" className="h-10 w-10 text-gold" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="9" />
          <path strokeLinecap="round" d="M9 9l6 6M15 9l-6 6" />
        </svg>
      </div>
      <h1 className="text-title">Página no encontrada</h1>
      <p className="mt-2 max-w-sm text-label-secondary">
        La barbería que buscas no existe o el enlace es incorrecto.
      </p>
      <Link href="/" className="ios-btn-primary mt-8">
        Ir al inicio
      </Link>
    </main>
  );
}
