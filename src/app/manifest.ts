import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Barber Studio',
    short_name: 'Barber Studio',
    description: 'Gestión profesional para tu barbería',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#030303',
    theme_color: '#000000',
    orientation: 'portrait',
    icons: [
      { src: '/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
      { src: '/icon.svg', sizes: '512x512', type: 'image/svg+xml' },
      { src: '/icon.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' }
    ]
  };
}
