
'use client';

import Link from 'next/link';
import { MyCartButton } from './MyCartButton';
import { MyOrdersButton } from './MyOrdersButton';
import { Utensils } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
            <Utensils className="h-8 w-8 text-foreground" />
            <span className="text-2xl font-bold font-headline text-primary">OrderEase</span>
        </Link>
        <nav className="flex items-center gap-1">
          <MyOrdersButton />
          <MyCartButton />
        </nav>
      </div>
    </header>
  );
}
