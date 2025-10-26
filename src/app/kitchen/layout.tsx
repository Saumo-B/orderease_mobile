
'use client';

import { KitchenHeader } from '@/components/KitchenHeader';
import { usePathname } from 'next/navigation';
import { KitchenBottomNav } from '@/components/KitchenBottomNav';
import { cn } from '@/lib/utils';
import { useOrder } from '@/context/OrderContext';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function KitchenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isPageLoading, branchLoading } = useOrder();
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    // This effect runs only on the client, after the initial render.
    // This ensures that the decision to show the loader or content
    // is made after hydration, preventing a mismatch.
    if (!isPageLoading && !branchLoading) {
      setShowLoader(false);
    }
  }, [isPageLoading, branchLoading]);

  const showHeader =
    pathname !== '/kitchen/login' && pathname !== '/kitchen/register';

  if (showLoader) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-background"
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {showHeader && <KitchenHeader />}
      <main className={cn('pb-24 no-scrollbar')}>
        {showHeader ? (
          <div className="max-w-4xl mx-auto">
            <div className="px-4 py-8">{children}</div>
          </div>
        ) : (
          children
        )}
      </main>
      {showHeader && <KitchenBottomNav />}
    </div>
  );
}
