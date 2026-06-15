import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'OpsAI Command Center',
  description: 'Real-time operational monitoring, forecasting, anomaly detection, and alerting dashboard for data analytics roles.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
