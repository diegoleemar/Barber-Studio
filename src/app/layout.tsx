import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta-sans'
});

export const metadata: Metadata = {
  title: 'Qfino — Agenda tu negocio al pelo, sin rollos',
  description:
    'La plataforma de agendamiento más limpia y precisa para gestionar tu negocio. Agenda tus citas de una y dile adiós al ir y venir de mensajes por WhatsApp. Diseñado para profesionales.',
  applicationName: 'Qfino',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg'
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'Qfino',
    statusBarStyle: 'default'
  }
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${plusJakartaSans.variable}`}>
      <body className="min-h-screen font-sans antialiased bg-base-950 text-label-primary">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}

/* ─── Service Worker Registration ─── */
function ServiceWorkerRegister() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });
}
        `
      }}
    />
  );
}
