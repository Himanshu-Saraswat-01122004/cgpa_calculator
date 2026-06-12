import type { Metadata } from 'next';
import './globals.css';
import AuthProvider from '@/components/SessionProvider';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'CGPA Calculator — Track Your Academic Performance',
  description:
    'A clean CGPA calculator to track your semester grades, visualize SGPA trends, and plan your academic future.',
  icons: { icon: '/icon.svg' },
  keywords: ['CGPA calculator', 'SGPA', 'grade tracker', 'academic performance'],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
        >
          <AuthProvider>
            {children}
            <Toaster richColors position="top-right" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
