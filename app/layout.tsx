import type { Metadata } from 'next';
import { Inter, Sora } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const sora = Sora({ subsets: ['latin'], variable: '--font-sora', weight: ['600', '700'] });

export const metadata: Metadata = {
  title: 'Voting System — Admin',
  description: 'School voting platform administration',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${sora.variable} font-sans bg-canvas text-ink antialiased`}>
        {children}
      </body>
    </html>
  );
}
