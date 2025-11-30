import type { Metadata } from "next";
import "./globals.css";
import Providers from '../providers';
import { TranscriptionProvider } from '../contexts/TranscriptionContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import ErrorBoundary from '../components/ErrorBoundary';

export const metadata: Metadata = {
  title: "Task Voice Manager",
  description: "Manage your tasks with voice commands",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
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