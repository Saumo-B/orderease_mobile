
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { useOrder } from '@/context/OrderContext';
import { Loader2, PackageOpen } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';


const statusConfig: Record<string, { text: string; className: string }> = {
    new: { text: 'New', className: 'bg-primary/20 text-primary' },
    paid: { text: 'In Progress', className: 'bg-yellow-500/20 text-yellow-300' },
    served: { text: 'In Progress', className: 'bg-yellow-500/20 text-yellow-300' },
};


export function OrdersSnapshot() {
  const { kitchenOrders } = useOrder();

  const pendingOrders = kitchenOrders
    .filter(
      (order) =>
        order.status === 'paid' ||
        order.status === 'new' ||
        order.status === 'served'
    )
    .slice(0, 5);

  const getOrderStatus = (order: typeof kitchenOrders[0]) => {
    if (order.served) return 'served';
    return order.status;
  };

  return (
    <Card className="bg-card/70 border-border h-full flex flex-col group transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-foreground">Live Order Queue</CardTitle>
            <CardDescription>Most recent pending orders.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        {pendingOrders.length > 0 ? (
          <ScrollArea className="h-full no-scrollbar">
            <div className="space-y-3">
              {pendingOrders.map((order) => {
                const currentStatus = getOrderStatus(order);
                const config = statusConfig[currentStatus] || { text: currentStatus, className: 'bg-gray-500' };

                return (
                    <div key={order.id} className="flex justify-between items-center bg-background/50 p-3 rounded-md">
                        <div>
                            <p className="font-bold text-foreground">#{order.token}</p>
                            <p className="text-xs text-muted-foreground">{order.items.length} items</p>
                        </div>
                        <Badge className={cn("capitalize", config.className)}>
                            {config.text}
                        </Badge>
                    </div>
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-col justify-center items-center h-full text-center text-muted-foreground">
             <PackageOpen className="h-10 w-10 mb-2" />
             <p>No pending orders.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
