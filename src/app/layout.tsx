import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: 'Barber Studio — Gestión profesional para barberías',
  description:
    'Plataforma SaaS moderna para gestionar tu barbería: reservas, clientes, servicios y más.',
  applicationName: 'Barber Studio',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png'
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'Barber Studio',
    statusBarStyle: 'black-translucent'
  }
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable}`}>
      <body className="min-h-screen font-sans antialiased">
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
