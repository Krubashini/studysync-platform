import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'StudySync | Handcrafted Collaborative Peer Learning Platform',
  description:
    'Peer-to-peer academic learning platform featuring verified course notes, interactive Q&A lounge, 1-on-1 mentorship bookings, and tactile streak progression.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#F9FAFB] text-duo-dark min-h-screen flex flex-col font-sans antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
