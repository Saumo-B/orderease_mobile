
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
    <Card className="glass-card border-white/5 h-full flex flex-col group transition-all duration-300">
      <CardHeader className="pb-4 border-b border-white/5">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Live Order Queue
            </CardTitle>
            <CardDescription className="text-xs mt-1">Most recent pending orders.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-0">
        {pendingOrders.length > 0 ? (
          <ScrollArea className="h-full no-scrollbar p-4">
            <div className="space-y-3">
              {pendingOrders.map((order) => {
                const currentStatus = getOrderStatus(order);
                const config = statusConfig[currentStatus] || { text: currentStatus, className: 'bg-gray-500' };

                return (
                  <div key={order.id} className="flex justify-between items-center bg-white/5 border border-white/5 p-3 rounded-xl transition-colors hover:bg-white/10 group/item">
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                        #{order.token.slice(-2)}
                      </div>
                      <div>
                        <p className="font-bold text-foreground group-hover/item:text-primary transition-colors">#{order.token}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{order.items.length} items</p>
                      </div>
                    </div>
                    <Badge className={cn("capitalize shadow-none font-medium px-2.5 py-0.5", config.className)}>
                      {config.text}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-col justify-center items-center h-full text-center text-muted-foreground opacity-50">
            <PackageOpen className="h-12 w-12 mb-3 text-primary/30" />
            <p className="text-sm">No pending orders.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
