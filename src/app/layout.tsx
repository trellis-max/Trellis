import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Trellis — Willow Acres',
  description: 'Operations platform for Willow Acres',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-trellis-cream text-trellis-charcoal antialiased">
        {children}
      </body>
    </html>
  );
}
