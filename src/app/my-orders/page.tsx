'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { SubPageHeader } from '@/components/SubPageHeader';
import {
  ShoppingCart,
  Loader2,
  CheckCircle,
  CircleDashed,
  Search,
} from 'lucide-react';
import { useEffect, useState, useCallback, Suspense } from 'react';
import { cn } from '@/lib/utils';
import type { Order } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSearchParams } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { useOrder } from '@/context/OrderContext';


const CUSTOMER_PHONE_KEY = 'customerPhoneNumber';

function MyOrderCard({ order }: { order: Order }) {
  const isCompleted = order.status === 'done' || order.status === 'served';
  const time = new Date(order.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <Card className={'transition-all shadow-md bg-card'}>
      <CardHeader className="p-4">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-3 font-headline text-xl">
            {isCompleted ? (
              <CheckCircle className="h-6 w-6 text-accent" />
            ) : (
              <CircleDashed className="h-6 w-6 text-primary" />
            )}
            <span>Order #{order.token}</span>
          </CardTitle>
          <div className="text-right">
            <p
              className={cn(
                'font-semibold text-sm',
                isCompleted ? 'text-accent' : 'text-primary'
              )}
            >
              {isCompleted ? 'Completed' : 'In Progress'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Placed at {time}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <p className="text-muted-foreground">
                {item.name} x {item.quantity}
              </p>
              <p className="font-medium">INR {item.price * item.quantity}</p>
            </div>
          ))}
        </div>
        <Separator className="my-4" />
        <div className="flex justify-between font-bold text-base">
          <p>Total Paid</p>
          <p>INR {order.total}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function MyOrdersView() {
  const searchParams = useSearchParams();
  const { myOrders, fetchMyOrders, myOrdersLoading } = useOrder();
  
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 10) {
      setPhone(value);
    }
  };

  const handleFindOrders = useCallback(async () => {
    setError(null);
    if (!phone || phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }
    setSearched(true);
    await fetchMyOrders(phone);
    try {
       localStorage.setItem(CUSTOMER_PHONE_KEY, phone);
    } catch(e) {
      console.error("Could not write to localStorage", e);
    }
  }, [phone, fetchMyOrders]);

  useEffect(() => {
    const phoneFromUrl = searchParams.get('phone');
    const phoneFromCache = localStorage.getItem(CUSTOMER_PHONE_KEY);
    const initialPhone = phoneFromUrl || phoneFromCache || '';

    if(initialPhone){
        setPhone(initialPhone);
        if(!searched) {
          setSearched(true);
          fetchMyOrders(initialPhone);
        }
    }
  }, [searchParams, fetchMyOrders, searched]);


  return (
    <>
      <SubPageHeader />
      <main className="container mx-auto py-8 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">
            My Orders
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Here's a list of your recent orders.
          </p>
        </div>

        <div className="max-w-md mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row items-end gap-2">
            <div className="w-full space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                 <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="10-digit mobile number"
                 />
            </div>
            <Button onClick={handleFindOrders} disabled={myOrdersLoading} className="w-full sm:w-auto">
              {myOrdersLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Find Orders
            </Button>
          </div>

          {error && <p className="text-sm text-center text-destructive">{error}</p>}
        </div>


        <div className="max-w-2xl mx-auto mt-12 space-y-6">
          {myOrdersLoading && (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          )}
          
          {!myOrdersLoading && searched && myOrders.length > 0 && (
             myOrders.map(order => (
              <MyOrderCard 
                key={order.id} 
                order={order} 
              />
            ))
          )}

          {!myOrdersLoading && searched && myOrders.length === 0 && !error &&(
             <div className="text-center py-16 bg-background rounded-lg border-2 border-dashed flex flex-col items-center justify-center">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No orders found for this phone number.</p>
              <Button asChild className="mt-4">
                <Link href="/menu">Go to Menu</Link>
              </Button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default function MyOrdersPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    }>
      <MyOrdersView />
    </Suspense>
  )
}
