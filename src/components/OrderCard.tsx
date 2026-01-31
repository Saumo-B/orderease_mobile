
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useOrder } from '@/context/OrderContext';
import type { Order } from '@/lib/types';
import { Button } from './ui/button';
import { Eye, X, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';
import { useState } from 'react';
import { UpdateOrderDialog } from './UpdateOrderDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const { completeOrder, markAsPaid, cancelOrder } = useOrder();
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [isServing, setIsServing] = useState(false);

  const time = new Date(order.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const handleComplete = async () => {
    setIsServing(true);
    await completeOrder(order.id);
    // No need to set isServing to false, as the component will re-render
    // with a disabled button once the order status is updated.
  };

  const handleMarkAsPaid = async () => {
    setIsPaying(true);
    await markAsPaid(order.id);
  };

  const handleCancelOrder = async () => {
    await cancelOrder(order.id);
  };

  const phoneNumber10Digits = order.customerPhone.slice(-10);
  const isCompleted = order.status === 'done';
  const isPaid = order.status === 'paid';

  const handleOrderUpdated = () => {
    // The context will automatically refetch, but we can trigger it manually if needed
    // For now, closing the dialog is enough as the context polling will handle the update.
  };

  const CardComponent = (
    <Card
      className={cn(
        'flex flex-col relative glass-card group transition-all duration-300 hover:shadow-glow hover:-translate-y-1 overflow-hidden border-white/5',
      )}
    >
      {/* Decorative gradient blob */}
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      <CardHeader className="pb-2 relative z-10">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'font-headline text-3xl font-black text-gradient drop-shadow-sm'
                )}
              >
                #{order.token}
              </div>
              {order.status === 'paid' && (
                <Badge className="bg-primary/20 text-primary border-primary/30 backdrop-blur-md shadow-[0_0_10px_-5px_hsl(var(--primary))]">
                  Paid
                </Badge>
              )}
              {order.status !== 'done' && (
                <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_12px_hsl(var(--primary))]" />
              )}
            </div>

            <div className="text-muted-foreground text-sm mt-1 flex flex-col gap-0.5">
              <span className="font-medium text-foreground/90">{order.customerName}</span>
              <span className="text-xs opacity-70">Ph: {phoneNumber10Digits}</span>
            </div>
          </div>
          <div className="text-xl font-bold text-white tracking-tight">
            ₹{order.total}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-grow flex flex-col space-y-3 py-2 overflow-hidden relative z-10">
        {!isCompleted && (
          <div
            className={cn('flex-grow no-scrollbar')}
          >
            <ul className="space-y-3 text-sm">
              {order.items.map((item, index) => {
                const isFullyServed = item.active === 0 && item.served;
                const isPartiallyServed = item.active > 0 && item.served;
                return (
                  <li key={index} className={cn("flex flex-col p-2 rounded-lg bg-background/40 backdrop-blur-sm border border-white/5 transition-colors hover:bg-background/60", isFullyServed && "opacity-40")}>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-foreground">
                        <span className="text-primary font-bold mr-2">{item.quantity}x</span> {item.name}
                      </span>
                    </div>

                    {isPartiallyServed && (
                      <div className="mt-1 flex gap-2 text-[10px] items-center">
                        <div className="px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground border border-white/10">Active: {item.active}</div>
                        <div className="px-1.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">Served: {item.servedQty}</div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        {!isCompleted && (
          <div className="flex justify-between items-center mt-auto pt-2">
            <div className="flex gap-2 items-center min-h-[28px]">
              {order.served && (
                <Badge className="bg-primary/20 text-primary border-primary/20">
                  Served
                </Badge>
              )}
            </div>
            <div className="text-xs font-mono text-muted-foreground bg-black/20 px-2 py-1 rounded-full">{time}</div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-3 pt-2 mt-auto relative z-10">
        {isCompleted ? (
          <div className="flex w-full justify-between items-center p-2 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Check className="w-4 h-4 text-primary" />
              </div>
              <span className="font-medium text-primary">Completed</span>
            </div>

            <div className="text-xs font-mono text-muted-foreground">{time}</div>
          </div>
        ) : (
          <>
            <Button
              size="sm"
              variant="outline"
              className="group/btn flex-1 bg-transparent border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 relative overflow-hidden"
              onClick={(e) => { e.stopPropagation(); handleMarkAsPaid(); }}
              disabled={order.status === 'paid' || isPaying}
            >
              {isPaying && order.status !== 'paid' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {order.status === 'paid' ? 'Paid' : 'Mark Paid'}
                </>
              )}
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95"
              onClick={(e) => { e.stopPropagation(); handleComplete(); }}
              disabled={order.served || isServing}
            >
              {isServing && !order.served ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Mark Served'
              )}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );


  if (isCompleted || isPaid) {
    return CardComponent;
  }

  return (
    <UpdateOrderDialog
      isOpen={isUpdateDialogOpen}
      setIsOpen={setIsUpdateDialogOpen}
      order={order}
      onOrderUpdated={handleOrderUpdated}
    >
      <div onClick={() => setIsUpdateDialogOpen(true)} className="cursor-pointer">
        {CardComponent}
      </div>
    </UpdateOrderDialog>
  );
}
