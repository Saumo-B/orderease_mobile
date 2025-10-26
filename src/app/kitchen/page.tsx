
'use client';

import { OrderCard } from '@/components/OrderCard';
import { Plus } from 'lucide-react';
import { useOrder } from '@/context/OrderContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreateOrderDialog } from '@/components/CreateOrderDialog';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function KitchenPage() {
  const { kitchenOrders, error, fetchKitchenOrders } = useOrder();
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
        className="h-[150px] flex items-center justify-center cursor-pointer group bg-card/70 border-border border-2 border-dashed"
        onClick={() => setIsCreateDialogOpen(true)}
      >
        <CardContent className="flex flex-row items-center justify-center text-center p-6">
          <Plus className="h-8 w-8 text-foreground transition-colors" />
          <p className="ml-4 text-base font-semibold text-foreground transition-colors">
            Create Order
          </p>
        </CardContent>
      </Card>
    </CreateOrderDialog>
  );

  return (
    <>
      {error && (
        <div className="text-center py-16 bg-destructive/10 text-destructive rounded-lg mb-8">
          <p>{error}</p>
        </div>
      )}

      <Tabs defaultValue="new-orders">
        <div className="flex justify-center items-center relative">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="new-orders">
              New Orders ({newOrders.length})
            </TabsTrigger>
            <TabsTrigger value="completed-orders">
              Completed Orders ({completedOrders.length})
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="new-orders">
          <div className="mt-6">
            {newOrders.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {createOrderCard}
                {newOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            ) : (
              <div>
                {createOrderCard}
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="completed-orders">
          <div className="mt-6">
            {completedOrders.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {completedOrders.map((order) => (
                  <div key={order.id} className="opacity-60">
                    <OrderCard order={order} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center bg-card rounded-lg h-[100px] flex flex-col items-center justify-center">
                <p className="text-muted-foreground">
                  No completed orders at the moment.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
