
'use client';

import { KitchenHeader } from '@/components/KitchenHeader';
import { KitchenSidebar } from '@/components/KitchenSidebar';
import { BranchSwitcher } from '@/components/BranchSwitcher';
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground animate-pulse">Loading kitchen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {showHeader && <KitchenSidebar />}

      <div className={cn("flex-grow flex flex-col min-h-screen transition-all duration-300", showHeader && "md:pl-20 lg:pl-[240px]")}>
        {showHeader && <div className="md:hidden"><KitchenHeader /></div>}
        {showHeader && <div className="hidden md:block sticky top-0 bg-background/80 backdrop-blur-md border-b border-white/5 px-8 py-4 flex items-center justify-between z-30">
          <h1 className="text-2xl font-bold font-headline text-gradient">Kitchen Dashboard</h1>
          <BranchSwitcher />
        </div>}

        <main className={cn('pb-24 md:pb-8 flex-grow overflow-x-hidden no-scrollbar', showHeader && "px-4 py-8 md:px-8")}>
          {children}
        </main>
      </div>

      {showHeader && <div className="md:hidden"><KitchenBottomNav /></div>}
    </div>
  );
}
