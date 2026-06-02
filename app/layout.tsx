import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'English → Portuguese Translator',
  description: 'Real-time English to Portuguese voice translation powered by OpenAI Realtime API',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}