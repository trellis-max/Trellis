import type { Metadata, Viewport } from 'next';
import './globals.css';
import { RegisterSW } from '@/lib/pwa/register-sw';

export const viewport: Viewport = {
  themeColor: '#D4AF37',
};

export const metadata: Metadata = {
  title: 'Willow Acres',
  description: 'Operations platform for Willow Acres',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Willow Acres',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-trellis-cream text-trellis-charcoal antialiased">
        <RegisterSW />
        {children}
      </body>
    </html>
  );
}
