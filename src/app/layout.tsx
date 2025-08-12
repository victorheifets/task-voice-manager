import type { Metadata } from "next";
import "./globals.css";
import Providers from '../providers';
import { TranscriptionProvider } from '../contexts/TranscriptionContext';

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
          <TranscriptionProvider>
            {children}
          </TranscriptionProvider>
        </Providers>
      </body>
    </html>
  );
}