import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Kirei Chisa - Premium Digital Services',
  description: 'Beli akun premium dan OTP nomor virtual dengan mudah, cepat, dan terpercaya.',
  icons: { icon: '/favicon.ico' },
  openGraph: {
    title: 'Kirei Chisa',
    description: 'Premium Digital Services - Premku & Nokos',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3500,
            style: { background: '#1f2937', color: '#fff', borderRadius: '12px', fontSize: '14px' },
            success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  );
}
