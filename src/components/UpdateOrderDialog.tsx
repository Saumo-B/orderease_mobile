
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button, buttonVariants } from '@/components/ui/button';
import { Loader2, Plus, Trash2, Minus, AlertTriangle, Ban, ShoppingBag, User, Phone, ChefHat } from 'lucide-react';
import type { MenuItem, Order, OrderItem } from '@/lib/types';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useOrder } from '@/context/OrderContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
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
import { cn, getBranchId } from '@/lib/utils';
import { axiosInstance } from '@/lib/axios-instance';

interface UpdateOrderDialogProps {
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onOrderUpdated: () => void;
  order: Order;
}

interface CurrentOrderItem extends OrderItem {
  // Corresponds to MenuItem id
  menuItemId: string;
  initialQty: number; // to track the original quantity
  outOfStock?: boolean;
}

export function UpdateOrderDialog({
  children,
  isOpen,
  setIsOpen,
  onOrderUpdated,
  order,
}: UpdateOrderDialogProps) {
  const [currentItems, setCurrentItems] = useState<CurrentOrderItem[]>([]);
  const [initialItems, setInitialItems] = useState<CurrentOrderItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateOrderItems, cancelOrder, menuItems: contextMenuItems, fetchMenuItems } = useOrder();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [menuError, setMenuError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');

  const initializeItems = useCallback((menu: MenuItem[]) => {
    const items = order.items.map(item => {
      const menuItem = menu.find(mi => mi.name === item.name);
      return {
        ...item,
        menuItemId: menuItem ? menuItem.id : 'unknown-item',
        initialQty: item.quantity,
        outOfStock: menuItem?.outOfStock || menuItem?.manualOutOfStock
      };
    }).filter(item => item.menuItemId !== 'unknown-item');

    setCurrentItems(items);
    setInitialItems(items);
  }, [order.items]);

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
              await fetchMenuItems(branchId);
              // Context will update, causing this effect to re-run if we depend on it?
              // Better to rely on the context updating and re-triggering.
              // But we are inside a function.
              // Let's just wait for context to populate? 
              // fetchMenuItems is async but doesn't return data directly.
              // So we rely on the next render.
              // But for instant load, we assume context is ready.
              setLoadingMenu(false); // Let the next render handle it or show empty
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
            // Only reset category if not set or invalid? No, nice to reset on re-open?
            // Actually, 'isOpen' check implies we just opened.
            setActiveCategory(allCategories[0]);
            initializeItems(formattedMenuItems);
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
  }, [isOpen, contextMenuItems, initializeItems, fetchMenuItems]);

  useEffect(() => {
    if (order && menuItems.length > 0) {
      initializeItems(menuItems);
    }
  }, [order, menuItems, initializeItems]);

  const updateItemQuantity = (itemToUpdate: MenuItem, newQuantity: number) => {
    if (itemToUpdate.outOfStock && newQuantity > 0) {
      const existingItem = currentItems.find(item => item.menuItemId === itemToUpdate.id);
      if (!existingItem) return;
    }

    setCurrentItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.menuItemId === itemToUpdate.id);

      if (existingItemIndex > -1) {
        const existingItem = prevItems[existingItemIndex];
        const initialItem = initialItems.find(i => i.menuItemId === itemToUpdate.id);
        const servedQty = initialItem?.servedQty ?? 0;

        if (newQuantity < servedQty) {
          // Cannot decrease below the already served quantity
          return prevItems;
        }

        if (newQuantity <= 0) {
          if (servedQty > 0) return prevItems; // Cannot remove if partially served
          return prevItems.filter((_, index) => index !== existingItemIndex);
        }
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = { ...updatedItems[existingItemIndex], quantity: newQuantity };
        return updatedItems;
      } else {
        if (newQuantity > 0) {
          const newItem: CurrentOrderItem = {
            id: 'temp-id-' + Math.random(),
            name: itemToUpdate.name,
            price: itemToUpdate.price,
            quantity: newQuantity,
            menuItemId: itemToUpdate.id,
            served: false,
            initialQty: 0,
            active: newQuantity,
            servedQty: 0,
            outOfStock: itemToUpdate.outOfStock,
          };
          return [...prevItems, newItem];
        }
        return prevItems;
      }
    });
  };

  const handleRemoveItem = (menuItemId: string) => {
    setCurrentItems((prevItems) => {
      const itemToRemove = prevItems.find(item => item.menuItemId === menuItemId);
      if (itemToRemove?.served) {
        return prevItems;
      }
      return prevItems.filter((item) => item.menuItemId !== menuItemId);
    });
  };

  const totalCost = useMemo(() => {
    return currentItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [currentItems]);

  const haveItemsChanged = useMemo(() => {
    if (currentItems.length !== initialItems.length) {
      return true;
    }
    const initialMap = new Map(initialItems.map(item => [item.menuItemId, item.quantity]));
    for (const item of currentItems) {
      if (!initialMap.has(item.menuItemId) || initialMap.get(item.menuItemId) !== item.quantity) {
        return true;
      }
    }
    return false;
  }, [currentItems, initialItems]);

  const isAnyItemServed = useMemo(() => {
    return initialItems.some(item => item.served);
  }, [initialItems]);

  const isSubmitDisabled = currentItems.length === 0 || isSubmitting || !haveItemsChanged;

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const itemsPayload = currentItems.map(item => {
      const initialItem = initialItems.find(i => i.menuItemId === item.menuItemId);
      return {
        menuItem: item.menuItemId,
        qty: item.quantity,
        price: item.price,
        served: initialItem ? initialItem.served : false,
        initialQty: initialItem ? initialItem.initialQty : 0
      };
    });

    const success = await updateOrderItems(order.id, { name: order.customerName, phone: order.customerPhone }, itemsPayload);

    if (success) {
      onOrderUpdated();
      setIsOpen(false);
    }

    setIsSubmitting(false);
  };

  const handleCancelOrder = async () => {
    const success = await cancelOrder(order.id);
    if (success) {
      onOrderUpdated();
      setIsOpen(false);
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
              <DialogTitle className="text-xl font-bold text-gradient">Update Order #{order.token}</DialogTitle>
              <p className="text-xs text-muted-foreground">Modify items for {order.customerName}</p>
            </div>
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
                    const currentItem = currentItems.find(ci => ci.menuItemId === item.id);
                    const quantity = currentItem?.quantity || 0;

                    const initialItem = initialItems.find(i => i.menuItemId === item.id);
                    const servedQty = initialItem?.servedQty ?? 0;
                    const isDecrementDisabled = quantity <= servedQty;

                    return (
                      <div key={item.id} className={cn(
                        "group relative flex flex-col p-4 rounded-2xl border border-white/5 bg-card/40 transition-all duration-300 hover:bg-card/80 hover:border-primary/30 hover:shadow-lg",
                        item.outOfStock && !currentItem && "opacity-60 grayscale bg-background/20"
                      )}>
                        {/* Content Top */}
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold text-foreground line-clamp-1 mb-1">{item.name}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-2 h-8">{item.description}</p>
                          </div>
                          <div className="ml-2 font-mono text-primary bg-background/50 backdrop-blur-md border border-white/10 px-2 py-1 rounded text-xs shrink-0">
                            ₹{item.price}
                          </div>
                        </div>

                        {/* Action Bottom */}
                        <div className="mt-auto pt-3 flex items-center justify-between">
                          {item.outOfStock && !currentItem ? (
                            <div className="w-full flex justify-center py-1.5 bg-destructive/10 text-destructive text-sm font-medium rounded-xl border border-destructive/20">
                              Out of Stock
                            </div>
                          ) : (
                            quantity === 0 ? (
                              <Button
                                size="sm"
                                className="w-full bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/20 hover:border-primary transition-all rounded-xl font-medium"
                                onClick={() => updateItemQuantity(item, 1)}
                                disabled={item.outOfStock}
                              >
                                {item.outOfStock ? <Ban className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                                {item.outOfStock ? "Unavailable" : "Add to Order"}
                              </Button>
                            ) : (
                              <div className="flex items-center justify-between w-full bg-primary/10 rounded-xl p-1 border border-primary/20">
                                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-primary hover:bg-primary hover:text-white transition-colors" onClick={() => updateItemQuantity(item, quantity - 1)} disabled={isDecrementDisabled}>
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
                    );
                  })}
                </div>
              </ScrollArea>
            </div>

            {/* RIGHT COLUMN: Sidebar (4 cols) */}
            <div className="lg:col-span-4 flex flex-col h-full bg-card/20 backdrop-blur-md border-l border-white/5 shadow-2xl relative z-10 overflow-hidden">

              {/* 1. Customer Info (Read Only) */}
              <div className="p-5 pb-2 space-y-3 flex-shrink-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-1 h-5 bg-blue-500 rounded-full shrink-0" />
                  <h3 className="font-bold text-base whitespace-nowrap">Order Details</h3>
                </div>
                <div className="gap-3 grid grid-cols-1">
                  <div className="p-3 bg-background/40 rounded-xl border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <User className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Customer</span>
                        <span className="font-medium text-sm">{order.customerName}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-background/40 rounded-xl border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Phone className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Phone</span>
                        <span className="font-medium text-sm">{order.customerPhone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="bg-white/5 my-1 flex-shrink-0" />

              {/* 2. Items List */}
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                <div className="px-5 py-2 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-primary shrink-0" />
                    <h3 className="font-bold text-base whitespace-nowrap">Order Items</h3>
                  </div>
                  <div className="flex gap-2">
                    {haveItemsChanged && <span className="text-[10px] bg-yellow-500/20 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded-full">Modified</span>}
                  </div>
                </div>

                <ScrollArea className="flex-1 w-full px-5">
                  {currentItems.length > 0 ? (
                    <div className="space-y-2 pb-4 pt-1">
                      {currentItems.map((item) => {
                        const initialItem = initialItems.find(i => i.menuItemId === item.menuItemId);
                        const servedQty = initialItem?.servedQty ?? 0;
                        const activeQty = item.quantity - servedQty;
                        const isPartiallyServed = servedQty > 0;

                        return (
                          <div key={item.menuItemId} className="flex flex-col gap-2 p-2.5 rounded-xl bg-background/40 border border-white/5 group relative overflow-hidden">
                            {/* Header */}
                            <div className="flex justify-between items-start z-10">
                              <span className="font-medium text-sm line-clamp-1 pr-2">{item.name}</span>
                              <span className="font-mono font-bold text-sm whitespace-nowrap">₹{item.price * item.quantity}</span>
                            </div>

                            {/* Subtext info */}
                            <div className="flex items-center justify-between z-10 text-xs text-muted-foreground mb-1">
                              <span>₹{item.price} ea</span>
                              {isPartiallyServed && (
                                <span className="text-yellow-500/80 mr-auto ml-2 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                                  Served: {servedQty}
                                </span>
                              )}
                            </div>

                            {/* Controls */}
                            <div className="flex items-center justify-between z-10">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-md bg-white/5 hover:bg-destructive hover:text-white transition-colors"
                                onClick={() => handleRemoveItem(item.menuItemId)}
                                disabled={item.served || servedQty > 0}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>

                              <div className="flex items-center bg-white/5 rounded-lg border border-white/5 h-7">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => {
                                    const itemToUpdate = menuItems.find(m => m.id === item.menuItemId);
                                    if (itemToUpdate) updateItemQuantity(itemToUpdate, item.quantity - 1);
                                  }}
                                  disabled={item.quantity <= servedQty}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => {
                                    const itemToUpdate = menuItems.find(m => m.id === item.menuItemId);
                                    if (itemToUpdate) updateItemQuantity(itemToUpdate, item.quantity + 1);
                                  }}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 gap-2 min-h-[160px]">
                      <ShoppingBag className="h-10 w-10 text-white/20" />
                      <p className="text-sm">No items</p>
                    </div>
                  )}
                </ScrollArea>
              </div>

              {/* 3. Footer */}
              <div className="p-5 bg-background/40 border-t border-white/5 backdrop-blur-md flex-shrink-0 space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-muted-foreground font-medium text-sm pb-1">Total Amount</span>
                  <span className="text-2xl font-bold font-mono text-white">₹{totalCost}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="h-11 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl">
                        Cancel
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="p-4 border-white/10 bg-black/90 backdrop-blur-xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Order #{order.token}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently cancel this order. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl border-white/10 hover:bg-white/5">Go Back</AlertDialogCancel>
                        <AlertDialogAction className="rounded-xl bg-destructive text-white hover:bg-destructive/90" onClick={handleCancelOrder}>
                          Cancel Order
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitDisabled}
                    className="h-11 text-base font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 rounded-xl"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : "Update"}
                  </Button>
                </div>
              </div>

            </div>

          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}





