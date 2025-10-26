
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
          const style = document.createElement('style');
          style.innerHTML = \`
            :root {
              --background: 0 0% 0%;
              --foreground: 0 0% 100%;
              --card: 0 0% 7.8%;
              --border: 0 0% 12.9%;
              --input: 0 0% 12.9%;
              --primary: 195 100% 50%;
              --ring: 195 100% 50%;
              --muted-foreground: 0 0% 78.8%;
            }
          \`;
          document.head.appendChild(style);
        }
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
          href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased min-h-screen bg-background text-foreground">
        <ThemeManager />
        <OrderProvider>
          {children}
          <Toaster />
        </OrderProvider>
      </body>
    </html>
  );
}
