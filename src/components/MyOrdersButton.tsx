
'use client';

import { ListOrdered } from 'lucide-react';
import { useOrder } from '@/context/OrderContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';


function MyOrdersButtonContent() {
  const { inProgressOrderCount } = useOrder();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const branchId = searchParams.get('branch');

  const isActive = pathname === '/my-orders';
  const ordersLink = branchId ? `/my-orders?branch=${branchId}` : '/my-orders';

  return (
    <Button variant={isActive ? 'default' : 'ghost'} asChild className="relative">
      <Link href={ordersLink} className="flex items-center gap-2">
        <ListOrdered />
        {inProgressOrderCount > 0 && (
           <Badge
            variant={isActive ? 'secondary' : 'default'}
            className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0"
          >
            {inProgressOrderCount}
          </Badge>
        )}
      </Link>
    </Button>
  );
}

export function MyOrdersButton() {
    return (
        <Suspense>
            <MyOrdersButtonContent />
        </Suspense>
    )
}
