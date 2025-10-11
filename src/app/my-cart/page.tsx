
'use client';

import { useOrder } from '@/context/OrderContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { SubPageHeader } from '@/components/SubPageHeader';
import { MinusCircle, PlusCircle, Trash2, ShoppingCart, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useRouter, useSearchParams } from 'next/navigation';
import { axiosInstance } from '@/lib/axios-instance';

const CUSTOMER_PHONE_KEY = 'customerPhoneNumber';
const CUSTOMER_NAME_KEY = 'customerName';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount, clearCart } = useOrder();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitAction, setSubmitAction] = useState<'payNow' | 'payLater' | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsClient(true);
    try {
      const savedPhone = localStorage.getItem(CUSTOMER_PHONE_KEY);
      if (savedPhone) {
        setCustomerPhone(savedPhone);
      }
      const savedName = localStorage.getItem(CUSTOMER_NAME_KEY);
      if (savedName) {
        setCustomerName(savedName);
      }
    } catch (error) {
      console.error("Could not read from localStorage", error);
    }
  }, []);

  const saveCustomerDetails = () => {
    try {
      localStorage.setItem(CUSTOMER_PHONE_KEY, customerPhone);
      localStorage.setItem(CUSTOMER_NAME_KEY, customerName);
    } catch(e) {
      console.error("Could not write to localStorage", e);
    }
  }

  const handlePayNow = async () => {
    setSubmitAction('payNow');
    setIsSubmitting(true);
    saveCustomerDetails();
    
    try {
      const payload = {
        items: cart.map((item) => ({
          menuItem: item.id,
          qty: item.quantity,
          price: item.price,
        })),
        customer: {
          name: customerName,
          phone: customerPhone,
        },
      };

      const res = await axiosInstance.post(
        `/api/orders`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      if (res.data.checkoutPageUrl) {
        clearCart();
        window.location.href = res.data.checkoutPageUrl;
      } else {
        console.error("checkoutPageUrl not found in response");
        alert("Something went wrong, could not proceed to payment.");
        setIsSubmitting(false);
      }

    } catch (err) {
      console.error("Error placing order:", err);
      alert("Something went wrong while placing your order.");
      setIsSubmitting(false);
    } 
  };
  
  const handlePayLater = async () => {
    setSubmitAction('payLater');
    setIsSubmitting(true);
    saveCustomerDetails();

    const branchId = searchParams.get('branch');

    try {
       const payload = {
        items: cart.map(item => ({
          menuItem: item.id,
          status: {
            active: item.quantity,
            served: 0
          },
          price: item.price
        })),
        customer: {
          name: customerName,
          phone: customerPhone,
        },
        branch: branchId,
      };

      const res = await axiosInstance.post(
        `/api/orderv2`,
        payload
      );

      if (res.status === 200 && res.data.id) {
        clearCart();
        router.push(`/order/${res.data.id}`);
      } else {
        throw new Error('Failed to create order. Invalid response from server.');
      }
    } catch (err) {
      console.error("Error creating order (Pay Later):", err);
      alert("Something went wrong while creating your order.");
    } finally {
      setIsSubmitting(false);
      setSubmitAction(null);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^[a-zA-Z]*$/.test(value) && value.length <= 15) {
      setCustomerName(value);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 10) {
      setCustomerPhone(value);
    }
  };

  const isFormInvalid =
    cart.length === 0 || !customerName.trim() || customerPhone.length !== 10;

  if (!isClient) return null;

  return (
    <>
      <SubPageHeader />
      <main className="container mx-auto py-8 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">
            My Cart
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            You have {cartCount} items in your cart.
          </p>
        </div>

        {cart.length > 0 ? (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="rounded-md object-cover"
                      />
                      <div className="flex-grow">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          INR {item.price}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                          >
                            <MinusCircle className="h-4 w-4" />
                          </Button>
                          <span>{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                          >
                            <PlusCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 bg-destructive/20 text-destructive hover:bg-destructive/30 hover:text-destructive"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Checkout</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between font-bold text-lg mb-4">
                  <span>Total</span>
                  <span>INR {cartTotal}</span>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Your Name</Label>
                    <Input
                      id="customerName"
                      value={customerName}
                      onChange={handleNameChange}
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">Phone Number</Label>
                    <Input
                      id="customerPhone"
                      type="tel"
                      value={customerPhone}
                      onChange={handlePhoneChange}
                      placeholder="e.g. 9876543210"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-2">
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handlePayNow}
                  disabled={isFormInvalid || isSubmitting}
                >
                  {isSubmitting && submitAction === 'payNow' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Pay Now'
                  )}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full"
                  onClick={handlePayLater}
                  disabled={isFormInvalid || isSubmitting}
                >
                  {isSubmitting && submitAction === 'payLater' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Pay Later'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        ) : (
          <div className="text-center py-16 bg-background rounded-lg border-2 border-dashed flex flex-col items-center justify-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Button asChild className="mt-4">
              <Link href="/menu">Go to Menu</Link>
            </Button>
          </div>
        )}
      </main>
    </>
  );
}
