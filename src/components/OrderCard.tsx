
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
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);

  const time = new Date(order.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const handleComplete = async () => {
    setIsServing(true);
    try {
      await completeOrder(order.id, order.status);
    } finally {
      setIsServing(false);
    }
  };

  const handleMarkAsPaid = async () => {
    setIsPaying(true);
    try {
      await markAsPaid(order.id, order.status);
    } finally {
      setIsPaying(false);
    }
  };

  const handleCancelOrder = async () => {
    await cancelOrder(order.id);
  };

  const phoneNumber10Digits = order.customerPhone.slice(-10);
  const isCompleted = order.status === 'done';
  const isPaid = order.status === 'paid' || order.status === 'done';

  const handleOrderUpdated = () => {
    // The context will automatically refetch, but we can trigger it manually if needed
    // For now, closing the dialog is enough as the context polling will handle the update.
  };

  return (
    <>
      <Card
        className={cn(
          'relative group h-[260px] w-full glass-card overflow-hidden transition-all duration-300 hover:shadow-2xl border-white/10 hover:border-primary/30 cursor-pointer',
        )}
        onClick={() => setIsViewDetailsOpen(true)}
      >
        <div className="flex flex-col h-full p-4 relative z-10">

          {/* --- HEADER --- */}
          <div className="flex justify-between items-start mb-2">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Order Token</span>
              <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50 drop-shadow-sm font-headline">#{order.token}</span>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <Badge className={cn("px-2 py-0.5 text-[10px] backdrop-blur-md shadow-sm border-white/10",
                (order.status === 'paid' || order.status === 'done') ? "bg-primary/20 text-primary" : "bg-white/10 text-muted-foreground"
              )}>
                {(order.status === 'paid' || order.status === 'done') ? 'Paid' : 'Unpaid'}
              </Badge>
              <Badge className={cn("px-2 py-0.5 text-[10px] backdrop-blur-md shadow-sm border-white/10",
                (order.status === 'served' || order.status === 'done' || order.served)
                  ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/20"
                  : "bg-white/10 text-muted-foreground"
              )}>
                {(order.status === 'served' || order.status === 'done' || order.served) ? 'Served' : 'Unserved'}
              </Badge>
            </div>
          </div>

          {/* --- BODY --- */}
          <div className="flex-grow flex flex-col justify-center items-center text-center space-y-1">
            <h3 className="font-bold text-lg text-foreground line-clamp-1 w-full">{order.customerName}</h3>
            <p className="text-sm text-primary font-medium">{order.items.length} Items</p>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span className="font-mono bg-white/5 px-2 py-1 rounded">₹{order.total}</span>
              <span className="font-mono">{time}</span>
            </div>
          </div>

          {/* --- FOOTER (ACTIONS) --- */}
          <div className="mt-auto pt-3 border-t border-white/5">
            {!isCompleted ? (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 h-8 text-xs border-white/20 hover:bg-white/10"
                  onClick={(e) => { e.stopPropagation(); handleMarkAsPaid(); }}
                  disabled={order.status === 'paid' || order.status === 'done' || isPaying}
                >
                  {isPaying ? <Loader2 className="h-3 w-3 animate-spin" /> : (order.status === 'paid' ? 'Paid' : 'Mark Paid')}
                </Button>
                <Button
                  size="sm"
                  className="flex-1 h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={(e) => { e.stopPropagation(); handleComplete(); }}
                  disabled={order.status === 'served' || order.status === 'done' || order.served || isServing}
                >
                  {isServing ? <Loader2 className="h-3 w-3 animate-spin" /> : (order.status === 'served' || order.served ? 'Served' : 'Mark Served')}
                </Button>
              </div>
            ) : (
              <div className="w-full py-1.5 text-center bg-primary/20 text-primary rounded-md text-sm font-bold border border-primary/20 flex items-center justify-center gap-2">
                <Check className="w-4 h-4" /> Completed
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* --- VIEW DETAILS DIALOG --- */}
      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        <DialogContent className="max-w-md w-full sm:max-w-lg bg-background/95 backdrop-blur-xl border border-white/10 shadow-2xl p-6">
          <DialogHeader className="space-y-4 border-b border-white/10 pb-4">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <DialogTitle className="text-3xl font-black font-headline tracking-tight">#{order.token}</DialogTitle>
                  <div className="flex flex-col">
                    <p className="text-base font-bold text-foreground">{order.customerName}</p>
                    {order.customerPhone && (
                      <p className="text-sm text-muted-foreground font-mono">{order.customerPhone}</p>
                    )}
                  </div>
                </div>

                {/* Right side - Margin added to avoid Close Button overlap */}
                <div className="flex flex-col items-end gap-2 mt-1 mr-8">
                  <span className="text-xs font-mono text-muted-foreground bg-white/5 px-2 py-0.5 rounded border border-white/10">{time}</span>
                  <div className="flex gap-1.5 flex-wrap justify-end">
                    {(order.status === 'paid' || order.status === 'done') &&
                      <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10">Paid</Badge>
                    }
                    {(order.status === 'served' || order.status === 'done' || order.served) &&
                      <Badge variant="outline" className="border-emerald-500/30 text-emerald-500 bg-emerald-500/10">Served</Badge>
                    }
                  </div>
                </div>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] -mx-6 px-6 my-2">
            <div className="space-y-6">

              {/* Items Section */}
              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Order Items</h4>
                <ul className="space-y-3">
                  {order.items.map((item, index) => {
                    const isFullyServed = item.active === 0 && item.served;
                    return (
                      <li key={index} className={cn("p-3 rounded-xl bg-white/5 border border-white/5 flex gap-4 items-center group transition-colors hover:bg-white/10", isFullyServed && "opacity-60 grayscale")}>
                        {/* Quantity */}
                        <div className="h-10 w-10 shrink-0 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg shadow-inner">
                          {item.quantity}
                        </div>

                        {/* Details */}
                        <div className="flex-grow min-w-0">
                          <p className="font-semibold text-foreground truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">₹{item.price} per unit</p>
                        </div>

                        {/* Total Price or Status */}
                        <div className="shrink-0 text-right">
                          {isFullyServed ? (
                            <Badge variant="secondary" className="text-[10px] h-5 bg-white/20">Served</Badge>
                          ) : (
                            <span className="font-mono font-bold text-white">₹{item.price * item.quantity}</span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Summary Section */}
              <div className="bg-gradient-to-br from-white/5 to-white/0 rounded-xl p-5 border border-white/10 space-y-3 shadow-sm">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-mono">₹{order.total}</span>
                </div>
                <Separator className="bg-white/10" />
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">Total</span>
                  <span className="text-2xl font-black text-primary font-headline">₹{order.total}</span>
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="flex-col sm:flex-row gap-3 pt-4 border-t border-white/10 mt-2">
            <Button variant="outline" size="lg" onClick={() => setIsViewDetailsOpen(false)} className="flex-1 border-white/20 hover:bg-white/10 h-10">Close</Button>
            {!isCompleted && (
              <Button
                size="lg"
                className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20"
                onClick={() => {
                  setIsViewDetailsOpen(false);
                  setIsUpdateDialogOpen(true);
                }}
              >
                Update Order
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- UPDATE ORDER DIALOG (Hidden mostly) --- */}
      {!isCompleted && (
        <UpdateOrderDialog
          isOpen={isUpdateDialogOpen}
          setIsOpen={setIsUpdateDialogOpen}
          order={order}
          onOrderUpdated={handleOrderUpdated}
        >
          <div className="hidden" />
        </UpdateOrderDialog>
      )}
    </>
  );
}
