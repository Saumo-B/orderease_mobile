'use client';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { XCircle } from 'lucide-react';

export default function OrderFailurePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/40 p-4">
      <Card className="w-full max-w-md text-center shadow-2xl animate-in fade-in zoom-in-95">
        <CardHeader className="bg-destructive text-destructive-foreground p-6 rounded-t-lg">
          <div className="flex justify-center mb-4">
            <XCircle className="h-16 w-16" />
          </div>
          <CardTitle className="text-3xl font-headline">
            Payment Failed
          </CardTitle>
          <p>Something went wrong with your transaction.</p>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-muted-foreground">
            We were unable to confirm your payment. Your order has not been
            placed. Please try again or contact support if the problem
            persists.
          </p>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button asChild className="w-full" size="lg">
            <Link href="/my-cart">Try Again</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/menu">Go to Menu</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
