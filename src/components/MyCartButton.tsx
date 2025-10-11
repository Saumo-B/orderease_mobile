
'use client';

import { ShoppingCart } from 'lucide-react';
import { useOrder } from '@/context/OrderContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function MyCartButtonContent() {
  const { cartCount } = useOrder();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const branchId = searchParams.get('branch');
  
  const isActive = pathname === '/my-cart';
  const cartLink = branchId ? `/my-cart?branch=${branchId}` : '/my-cart';

  return (
    <Button variant={isActive ? 'default' : 'ghost'} asChild className="relative">
      <Link href={cartLink} className="flex items-center gap-2">
        <ShoppingCart />
        {cartCount > 0 && (
          <Badge
            variant={isActive ? 'secondary' : 'default'}
            className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0"
          >
            {cartCount}
          </Badge>
        )}
      </Link>
    </Button>
  );
}


export function MyCartButton() {
    return (
        <Suspense>
            <MyCartButtonContent />
        </Suspense>
    )
}
