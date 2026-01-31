
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { OrderProvider } from '@/context/OrderContext';
import { ThemeManager } from '@/components/ThemeManager';

export const metadata: Metadata = {
  title: 'OrderEase',
  description: 'Simplify your ordering process',
};

const themeInitializerScript = `
  (function() {
    try {
      const storedSettings = localStorage.getItem('themeSettings');
      if (storedSettings) {
        const settings = JSON.parse(storedSettings);
        if (settings.set === 'dark') {
          document.documentElement.classList.add('dark');
        }
      } else {
        // Default to dark mode for that premium feel
        document.documentElement.classList.add('dark'); 
      }
    } catch (e) {
      console.error('Failed to apply initial theme', e);
    }
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="no-scrollbar" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitializerScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased min-h-screen bg-background text-foreground selection:bg-primary/30">
        <ThemeManager />
        <OrderProvider>
          {children}
          <Toaster />
        </OrderProvider>
      </body>
    </html>
  );
}
