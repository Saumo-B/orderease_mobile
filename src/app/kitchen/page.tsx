'use client';

import { OrderCard } from '@/components/OrderCard';
import { Plus } from 'lucide-react';
import { useOrder } from '@/context/OrderContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreateOrderDialog } from '@/components/CreateOrderDialog';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import PageTransition from '@/components/PageTransition';
import { OrderListSkeleton } from '@/components/OrderListSkeleton';

export default function KitchenPage() {
  const { kitchenOrders, error, fetchKitchenOrders, isPageLoading } = useOrder();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const newOrders = kitchenOrders
    .filter(
      (order) =>
        order.status === 'paid' ||
        order.status === 'new' ||
        order.status === 'served'
    )
    .sort((a, b) => a.timestamp - b.timestamp);
  const completedOrders = kitchenOrders.filter(
    (order) => order.status === 'done'
  );

  const handleOrderCreated = () => {
    fetchKitchenOrders();
  };

  const createOrderCard = (
    <CreateOrderDialog
      isOpen={isCreateDialogOpen}
      setIsOpen={setIsCreateDialogOpen}
      onOrderCreated={handleOrderCreated}
    >
      <Card
        className="h-[200px] flex items-center justify-center cursor-pointer group glass-card border-dashed border-2 border-white/20 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
        onClick={() => setIsCreateDialogOpen(true)}
      >
        <CardContent className="flex flex-col items-center justify-center text-center p-6 gap-3">
          <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors group-hover:scale-110 duration-300">
            <Plus className="h-8 w-8 text-primary" />
          </div>
          <p className="text-base font-semibold text-foreground/80 group-hover:text-primary transition-colors">
            Create New Order
          </p>
        </CardContent>
      </Card>
    </CreateOrderDialog>
  );

  if (isPageLoading) {
    return (
      <PageTransition>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <OrderListSkeleton />
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      {error && (
        <div className="text-center py-4 bg-destructive/10 text-destructive rounded-lg mb-8 border border-destructive/20 animate-in fade-in slide-in-from-top-2">
          <p className="font-medium">{error}</p>
        </div>
      )}

      <Tabs defaultValue="new-orders" className="space-y-6">
        <div className="flex justify-center items-center sticky top-[70px] z-20 md:static">
          <TabsList className="grid w-full grid-cols-2 max-w-md bg-card/80 backdrop-blur-xl border border-white/5 h-12 p-1 rounded-full shadow-lg">
            <TabsTrigger
              value="new-orders"
              className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 font-medium"
            >
              Active ({newOrders.length})
            </TabsTrigger>
            <TabsTrigger
              value="completed-orders"
              className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 font-medium"
            >
              Completed ({completedOrders.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="new-orders" className="outline-none">
          <div className="mt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {createOrderCard}
              {newOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
            {newOrders.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground italic opacity-50">
                No active orders. Time to prep!
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed-orders" className="outline-none">
          <div className="mt-2">
            {completedOrders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 opacity-80 hover:opacity-100 transition-opacity">
                {completedOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            ) : (
              <div className="text-center bg-card/40 border border-white/5 rounded-2xl h-[200px] flex flex-col items-center justify-center">
                <p className="text-muted-foreground">
                  History is empty today.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </PageTransition>
  );
}
