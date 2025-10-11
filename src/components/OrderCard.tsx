
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
import { Eye, X, Loader2 } from 'lucide-react';
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

  const handleOrderUpdated = () => {
    // The context will automatically refetch, but we can trigger it manually if needed
    // For now, closing the dialog is enough as the context polling will handle the update.
  };

  const CardComponent = (
    <Card
      className={cn(
        'flex flex-col relative bg-card/70 border-white/10 shadow-lg',
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <div
              className={cn(
                'font-headline text-2xl font-bold text-white/90'
              )}
            >
              #{order.token}
            </div>
            <div className="text-white/60 text-sm mt-1">
              <div>Name: {order.customerName}</div>
              <div>Phone: {phoneNumber10Digits}</div>
            </div>
          </div>
        </div>
        <div className="text-lg font-bold text-green-400 mt-2">
          INR {order.total}
        </div>
      </CardHeader>

      <CardContent className="flex-grow flex flex-col space-y-3 py-2 overflow-hidden">
        {!isCompleted && (
           <div
            className={cn('flex-grow no-scrollbar')}
          >
            <ul className="space-y-2 text-sm text-white/70">
              {order.items.map((item, index) => {
                 const isFullyServed = item.active === 0 && item.served;
                 const isPartiallyServed = item.active > 0 && item.served;
                return (
                  <li key={index} className={cn("flex flex-col", isFullyServed && "text-white/40")}>
                    <span>
                        {item.quantity}x {item.name}
                    </span>
                    {isPartiallyServed && (
                        <span className="text-xs text-yellow-400/80">
                            (Active: {item.active}, Served: {item.servedQty})
                        </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        {!isCompleted && (
          <div className="flex justify-between items-center mt-auto">
            <div className="flex gap-2 items-center min-h-[28px]">
              {order.status === 'paid' && (
                <Badge className="bg-yellow-500/20 text-yellow-300">
                  Paid
                </Badge>
              )}
              {order.served && (
                <Badge className="bg-yellow-500/20 text-yellow-300">
                  Served
                </Badge>
              )}
            </div>
            <div className="text-white/60 text-sm">{time}</div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2 pt-0 mt-auto">
        {isCompleted ? (
          <div className="flex w-full justify-between items-center">
            <Badge className="bg-green-500/20 text-green-300">
              Completed
            </Badge>
            <div className="text-white/60 text-sm">{time}</div>
          </div>
        ) : (
          <>
            <Button
              size="sm"
              className="w-full bg-cyan-500/20 text-cyan-300"
              onClick={(e) => { e.stopPropagation(); handleMarkAsPaid(); }}
              disabled={order.status === 'paid' || isPaying}
            >
              {isPaying && order.status !== 'paid' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Paid'
              )}
            </Button>
            <Button
              size="sm"
              className="w-full bg-cyan-500/20 text-cyan-300"
              onClick={(e) => { e.stopPropagation(); handleComplete(); }}
              disabled={order.served || isServing}
            >
              {isServing && !order.served ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Served'
              )}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );


  if (isCompleted) {
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
