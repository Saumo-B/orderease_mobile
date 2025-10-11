
'use client';

import Link from 'next/link';
import { MyCartButton } from './MyCartButton';
import { MyOrdersButton } from './MyOrdersButton';
import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SubPageHeaderContent() {
  const searchParams = useSearchParams();
  const branchId = searchParams.get('branch');
  
  const menuLink = branchId ? `/menu?branch=${branchId}` : '/menu';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
             <Button variant="outline" asChild>
               <Link href={menuLink}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Menu
                </Link>
            </Button>
        </div>
        <nav className="flex items-center gap-1">
          <MyOrdersButton />
          <MyCartButton />
        </nav>
      </div>
    </header>
  );
}

export function SubPageHeader() {
  return (
    <Suspense fallback={<div className="h-16" />}>
      <SubPageHeaderContent />
    </Suspense>
  )
}
