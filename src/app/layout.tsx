'use client';
import { Toaster } from '@/components/ui/sonner';
import { ToastProvider } from '@/components/ui/toast';
import AppProvider from '@/contexts/AppProvider';
import { fontVariables } from '@/lib/font';
import { cn } from '@/lib/utils';
import "@/styles/editor-styles.css";
import NextTopLoader from 'nextjs-toploader';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import './globals.css';
import './theme.css';

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>{process.env.NEXT_PUBLIC_APP_NAME}</title>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={cn(
          'bg-background overscroll-none font-sans antialiased',
          'theme-default',
          'theme-scaled',
          fontVariables
        )}
      >
        <ToastProvider>
          <AppProvider>
            <NextTopLoader showSpinner={false} />
            <NuqsAdapter>
              <Toaster />
              {children}
            </NuqsAdapter>
          </AppProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
