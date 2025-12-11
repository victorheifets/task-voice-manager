import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from '../providers';
import { TranscriptionProvider } from '../contexts/TranscriptionContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import ErrorBoundary from '../components/ErrorBoundary';
import ServiceWorkerRegistration from '../components/ServiceWorkerRegistration';
import SkipLink from '../components/accessibility/SkipLink';

export const metadata: Metadata = {
  title: "Task Voice Manager",
  description: "AI-powered task management with voice recognition",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TaskVoice",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-192x192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#2196F3",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ServiceWorkerRegistration />
        <SkipLink />
        <Providers>
          <ErrorBoundary>
            <NotificationProvider>
              <TranscriptionProvider>
                {children}
              </TranscriptionProvider>
            </NotificationProvider>
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}