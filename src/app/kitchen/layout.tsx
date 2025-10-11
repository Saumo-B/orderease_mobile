'use client';

import { KitchenHeader } from '@/components/KitchenHeader';
import { usePathname } from 'next/navigation';
import { KitchenBottomNav } from '@/components/KitchenBottomNav';
import { cn } from '@/lib/utils';

export default function KitchenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showHeader =
    pathname !== '/kitchen/login' && pathname !== '/kitchen/register';

  return (
    <div className="min-h-screen bg-background text-foreground">
      {showHeader && <KitchenHeader />}
      <main className={cn('pb-24 md:pb-0 no-scrollbar')}>
        {showHeader ? (
          <div className="max-w-4xl mx-auto">
            <div className="px-4 md:px-8 py-8">{children}</div>
          </div>
        ) : (
          children
        )}
      </main>
      {showHeader && <KitchenBottomNav />}
    </div>
  );
}
