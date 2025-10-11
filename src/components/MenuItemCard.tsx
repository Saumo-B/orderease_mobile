
'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useOrder } from '@/context/OrderContext';
import type { MenuItem } from '@/lib/types';
import { PlusCircle, MinusCircle } from 'lucide-react';

interface MenuItemCardProps {
  item: MenuItem;
}

export function MenuItemCard({ item }: MenuItemCardProps) {
  const { addToCart, updateQuantity, cart } = useOrder();
  const cartItem = cart.find((cartItem) => cartItem.id === item.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = () => {
    addToCart(item);
  };

  return (
    <Card className="flex flex-col overflow-hidden duration-300">
      <CardHeader className="p-0">
        <div className="aspect-video relative">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
            data-ai-hint={item.name.toLowerCase().split(' ').slice(0,2).join(' ')}
          />
        </div>
        <div className="p-6 pb-2">
          <CardTitle className="font-headline text-xl">{item.name}</CardTitle>
          <CardDescription className="mt-2 h-10">{item.description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-grow"></CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center p-6 pt-0">
        <p className="text-xl font-bold text-primary mb-4 sm:mb-0">INR {item.price}</p>
        {quantity === 0 ? (
          <Button onClick={handleAddToCart} className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, quantity - 1)}>
              <MinusCircle className="h-4 w-4" />
            </Button>
            <span className="text-lg font-bold w-8 text-center">{quantity}</span>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, quantity + 1)}>
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
