
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Plus, Trash2, Minus, AlertTriangle, Ban, ShoppingBag, User, Phone, ChefHat } from 'lucide-react';
import type { MenuItem } from '@/lib/types';
import { useState, useMemo, useEffect } from 'react';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { axiosInstance } from '@/lib/axios-instance';
import { getBranchId, cn } from '@/lib/utils';
import { useOrder } from '@/context/OrderContext';
import { Badge } from '@/components/ui/badge';

interface CreateOrderDialogProps {
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onOrderCreated: () => void;
}

interface OrderItem extends MenuItem {
  quantity: number;
}

export function CreateOrderDialog({
  children,
  isOpen,
  setIsOpen,
  onOrderCreated,
}: CreateOrderDialogProps) {
  const { menuItems: contextMenuItems, fetchMenuItems } = useOrder();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [menuError, setMenuError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    async function loadMenu() {
      if (isOpen) {
        setLoadingMenu(true);
        setMenuError(null);

        try {
          let itemsToUse = contextMenuItems;

          if (!itemsToUse || itemsToUse.length === 0) {
            const branchId = getBranchId();
            if (branchId) {
              // Attempt fetch if missing
              await fetchMenuItems(branchId);
              setLoadingMenu(false);
              // Note: We rely on the context updating to trigger a re-render or effect re-run if we added contextMenuItems to deps.
              // But since we are inside a function, this specific closure won't see the new items immediately.
              // However, the component WILL re-render when contextMenuItems updates,
              // and we should have a separate effect that syncs props/context to local state.
              return;
            }
          }

          if (itemsToUse.length > 0) {
            // Map FullMenuItem to MenuItem (Ui type)
            const formattedMenuItems: MenuItem[] = itemsToUse.map(item => ({
              id: item.id,
              name: item.name,
              description: item.description,
              price: item.price,
              image: item.imageUrl, // FullMenuItem has imageUrl, MenuItem has image
              category: item.category,
              outOfStock: item.outOfStock || item.manualOutOfStock,
              manualOutOfStock: item.manualOutOfStock,
            }));

            const uniqueCategories = Array.from(new Set(formattedMenuItems.map(item => item.category)));
            uniqueCategories.sort();
            formattedMenuItems.sort((a, b) => a.name.localeCompare(b.name));

            setMenuItems(formattedMenuItems);
            const allCategories = ['All', ...uniqueCategories];
            setCategories(allCategories);
            // Only reset category if not initialized? Or always "All" on open?
            // Previous logic set it to "All" on open via resetForm effect.
            // setActiveCategory(allCategories[0]); 
          }
        } catch (err: any) {
          console.error("Failed to load menu", err);
          setMenuError("Could not load menu.");
        } finally {
          setLoadingMenu(false);
        }
      }
    }

    loadMenu();
  }, [isOpen, contextMenuItems, fetchMenuItems]);

  const resetForm = () => {
    setCustomerName('');
    setCustomerPhone('');
    setOrderItems([]);
    setActiveCategory('All');
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const updateItemQuantity = (itemToUpdate: MenuItem, newQuantity: number) => {
    if (itemToUpdate.outOfStock && newQuantity > 0) return;

    setOrderItems(prevItems => {
      if (newQuantity <= 0) {
        return prevItems.filter(item => item.id !== itemToUpdate.id);
      }

      const existingItem = prevItems.find(item => item.id === itemToUpdate.id);

      if (existingItem) {
        return prevItems.map(item =>
          item.id === itemToUpdate.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      }

      return [...prevItems, { ...itemToUpdate, quantity: newQuantity }];
    });
  };

  const handleRemoveItem = (itemId: string) => {
    setOrderItems((prevItems) => {
      return prevItems.filter((item) => item.id !== itemId);
    });
  };

  const total = useMemo(() => {
    return orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [orderItems]);

  const isSubmitDisabled =
    !customerName.trim() ||
    customerPhone.length !== 10 ||
    orderItems.length === 0 ||
    isSubmitting;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const branchId = getBranchId();
    if (!branchId) {
      console.error("Branch ID is missing, cannot create order.");
      setIsSubmitting(false);
      return;
    }
    try {
      const payload = {
        items: orderItems.map((item) => ({
          menuItem: item.id,
          status: {
            active: item.quantity,
            served: 0
          },
          price: item.price,
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

      if (res.status === 200 && res.data.token) {
        onOrderCreated();
        setIsOpen(false);
      } else {
        throw new Error(
          'Failed to create order. Invalid response from server.'
        );
      }
    } catch (error) {
      console.error('Failed to create order:', error);
      // Removed toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^[a-zA-Z\s]*$/.test(value) && value.length <= 20) {
      setCustomerName(value);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 10) {
      setCustomerPhone(e.target.value);
    }
  };

  const filteredMenuItems = useMemo(() => {
    if (activeCategory === 'All') {
      return menuItems;
    }
    return menuItems.filter(item => item.category === activeCategory);
  }, [activeCategory, menuItems]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-[1200px] w-full h-[90vh] glass-card border-white/10 flex flex-col p-0 bg-background/95 backdrop-blur-xl overflow-hidden rounded-3xl">

        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-card/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <ChefHat className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gradient">Create New Order</DialogTitle>
              <p className="text-xs text-muted-foreground">Select items and enter customer details</p>
            </div>
          </div>
          <div className="md:hidden">
            {/* Mobile Summary Indicator could go here */}
          </div>
        </div>

        {loadingMenu ? (
          <div className="flex flex-col gap-4 justify-center items-center flex-grow">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="text-muted-foreground animate-pulse">Loading menu...</p>
          </div>
        ) : menuError ? (
          <div className="flex flex-col justify-center items-center flex-grow text-destructive">
            <AlertTriangle className="h-12 w-12 mb-4" />
            <p className="text-lg font-medium">{menuError}</p>
          </div>
        ) : (
          <div className="flex flex-col lg:grid lg:grid-cols-12 h-full overflow-hidden">

            {/* LEFT COLUMN: Menu Selection (8 cols) */}
            <div className="lg:col-span-8 flex flex-col h-full overflow-hidden bg-background/30 relative">

              {/* Categories Stick Header */}
              <div className="p-4 pb-2">
                <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
                  <TabsList className="w-full justify-start overflow-x-auto bg-transparent p-1 gap-2 no-scrollbar">
                    {categories.map((cat) => (
                      <TabsTrigger
                        key={cat}
                        value={cat}
                        className="rounded-full border border-white/10 px-5 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary transition-all shadow-sm hover:bg-white/5"
                      >
                        {cat}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>

              {/* Menu Grid */}
              <ScrollArea className="flex-grow px-4 pb-20 lg:pb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 pb-4">
                  {filteredMenuItems.map((item: MenuItem) => {
                    const currentItem = orderItems.find(oi => oi.id === item.id);
                    const quantity = currentItem?.quantity || 0;
                    return (
                      <div key={item.id} className={cn(
                        "group relative flex flex-col p-4 rounded-2xl border border-white/5 bg-card/40 transition-all duration-300 hover:bg-card/80 hover:border-primary/30 hover:shadow-lg",
                        item.outOfStock && "opacity-60 grayscale bg-background/20"
                      )}>
                        {/* Content Top */}
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold text-foreground line-clamp-1 mb-1">{item.name}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-2 h-8">{item.description}</p>
                          </div>
                          <Badge variant="outline" className="ml-2 bg-background/50 backdrop-blur-md border-white/10 shrink-0 font-mono text-primary">
                            ₹{item.price}
                          </Badge>
                        </div>

                        {/* Action Bottom */}
                        <div className="mt-auto pt-3 flex items-center justify-between">
                          {item.outOfStock ? (
                            <Badge variant="destructive" className="w-full justify-center py-1.5 opacity-90">Out of Stock</Badge>
                          ) : (
                            quantity === 0 ? (
                              <Button
                                size="sm"
                                className="w-full bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/20 hover:border-primary transition-all rounded-xl font-medium"
                                onClick={() => updateItemQuantity(item, 1)}
                              >
                                <Plus className="h-4 w-4 mr-2" /> Add to Order
                              </Button>
                            ) : (
                              <div className="flex items-center justify-between w-full bg-primary/10 rounded-xl p-1 border border-primary/20">
                                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-primary hover:bg-primary hover:text-white transition-colors" onClick={() => updateItemQuantity(item, quantity - 1)}>
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="font-bold text-primary font-mono">{quantity}</span>
                                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-primary hover:bg-primary hover:text-white transition-colors" onClick={() => updateItemQuantity(item, quantity + 1)}>
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </div>

            {/* RIGHT COLUMN: Sidebar (4 cols) */}
            <div className="lg:col-span-4 flex flex-col h-full bg-card/20 backdrop-blur-md border-l border-white/5 shadow-2xl relative z-10 overflow-hidden">

              {/* 1. Customer Details Section */}
              <div className="p-5 pb-2 space-y-3 flex-shrink-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-1 h-5 bg-blue-500 rounded-full shrink-0" />
                  <h3 className="font-bold text-base whitespace-nowrap">Customer Details</h3>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={customerName}
                      onChange={handleNameChange}
                      placeholder="Name"
                      className="pl-9 bg-background/50 border-white/10 h-10 rounded-xl focus:ring-primary/50 focus:border-primary/50 text-sm"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={customerPhone}
                      onChange={handlePhoneChange}
                      placeholder="Phone (10 digits)"
                      className="pl-9 bg-background/50 border-white/10 h-10 rounded-xl focus:ring-primary/50 focus:border-primary/50 text-sm"
                      maxLength={10}
                    />
                  </div>
                </div>
              </div>

              <Separator className="bg-white/5 my-1 flex-shrink-0" />

              {/* 2. Cart Items List */}
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                <div className="px-5 py-2 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-primary shrink-0" />
                    <h3 className="font-bold text-base whitespace-nowrap">Current Order</h3>
                  </div>
                  <Badge variant="secondary" className="bg-white/5 text-xs px-2 py-0.5 h-6">{orderItems.length}</Badge>
                </div>

                <ScrollArea className="flex-1 w-full px-5">
                  {orderItems.length > 0 ? (
                    <div className="space-y-2 pb-4 pt-1">
                      {orderItems.map((item) => (
                        <div key={item.id} className="flex flex-col gap-2 p-2.5 rounded-xl bg-background/40 border border-white/5 group transition-colors hover:bg-background/60">
                          <div className="flex justify-between items-start">
                            <span className="font-medium text-sm line-clamp-1 pr-2">{item.name}</span>
                            <span className="font-mono font-bold text-sm whitespace-nowrap">₹{item.price * item.quantity}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-[11px] text-muted-foreground">₹{item.price} ea</div>
                            <div className="flex items-center gap-1.5 ml-auto">
                              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md bg-white/5 hover:bg-destructive hover:text-white transition-colors" onClick={() => handleRemoveItem(item.id)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                              <div className="flex items-center bg-white/5 rounded-lg border border-white/5 h-6">
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateItemQuantity(item, item.quantity - 1)}>
                                  <Minus className="h-2 w-2" />
                                </Button>
                                <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateItemQuantity(item, item.quantity + 1)}>
                                  <Plus className="h-2 w-2" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 gap-2 min-h-[160px]">
                      <ShoppingBag className="h-10 w-10 text-white/20" />
                      <p className="text-sm">Cart is empty</p>
                    </div>
                  )}
                </ScrollArea>
              </div>

              {/* 3. Footer Totals */}
              <div className="p-5 bg-background/40 border-t border-white/5 backdrop-blur-md flex-shrink-0">
                <div className="flex justify-between items-end mb-3">
                  <span className="text-muted-foreground font-medium text-sm pb-1">Total Amount</span>
                  <span className="text-2xl font-bold font-mono text-white">₹{total}</span>
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitDisabled}
                  className="w-full h-11 text-base font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 rounded-xl"
                >
                  {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : "Place Order"}
                </Button>
              </div>

            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}


