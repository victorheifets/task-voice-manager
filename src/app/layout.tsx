import type { Metadata } from "next";
import "./globals.css";
import Providers from '../providers';
import Script from 'next/script';

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
    <html lang="en" className="dark-mode">
      <head>
        <Script id="theme-script" strategy="beforeInteractive">
          {`
          (function() {
            try {
              // Apply dark mode classes
              document.documentElement.classList.add('dark-mode');
              document.body.classList.add('dark-mode');
              
              // Store preference in localStorage
              localStorage.setItem('themeMode', 'dark');
              
              // Apply pure black background immediately
              document.documentElement.style.backgroundColor = '#000000';
              document.body.style.backgroundColor = '#000000';
            } catch (e) {
              console.error('Error applying dark mode:', e);
            }
          })();
          `}
        </Script>
      </head>
      <body className="antialiased dark-mode" style={{ backgroundColor: '#000000' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
