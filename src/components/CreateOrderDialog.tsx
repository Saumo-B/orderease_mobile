
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
import { Loader2, Plus, Trash2, Minus, AlertTriangle, Ban } from 'lucide-react';
import type { MenuItem } from '@/lib/types';
import { useState, useMemo, useEffect } from 'react';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { axiosInstance } from '@/lib/axios-instance';
import { getBranchId } from '@/lib/utils';
import { cn } from '@/lib/utils';

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
    async function fetchMenu() {
      if (isOpen) {
        setLoadingMenu(true);
        setMenuError(null);
        try {
          const branchId = getBranchId();
          if (!branchId) {
            throw new Error("Branch ID not found. Please log in again.");
          }
          const response = await axiosInstance.get(`/api/menu?branch=${branchId}`);
          if (response.data && Array.isArray(response.data)) {
            const formattedMenuItems: MenuItem[] = response.data.map((item: any) => ({
              id: item._id,
              name: item.name,
              description: item.description,
              price: item.price,
              image: item.imageUrl,
              category: item.category,
              outOfStock: item.outOfStock || item.manualOutOfStock,
              manualOutOfStock: item.manualOutOfStock,
            }));
            const uniqueCategories = Array.from(new Set(formattedMenuItems.map(item => item.category)));
            uniqueCategories.sort();
            
            // Sort menu items alphabetically by name
            formattedMenuItems.sort((a, b) => a.name.localeCompare(b.name));

            setMenuItems(formattedMenuItems);
            const allCategories = ['All', ...uniqueCategories];
            setCategories(allCategories);
            setActiveCategory(allCategories[0]);
          } else {
            throw new Error("Invalid data format from API");
          }
        } catch (err: any) {
          console.error("Failed to fetch menu:", err);
          setMenuError(err.message || "Could not load the menu. Please try again.");
        } finally {
          setLoadingMenu(false);
        }
      }
    }
    fetchMenu();
  }, [isOpen]);

  const resetForm = () => {
    setCustomerName('');
    setCustomerPhone('');
    setOrderItems([]);
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const updateItemQuantity = (itemToUpdate: MenuItem, newQuantity: number) => {
    if(itemToUpdate.outOfStock && newQuantity > 0) return;

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
        // You might want to show an error to the user here.
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
     if (/^[a-zA-Z]*$/.test(value) && value.length <= 15) {
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
      <DialogContent className="sm:max-w-5xl bg-card border-border flex flex-col h-full">
        <DialogHeader>
          <DialogTitle className="text-primary">Create Order</DialogTitle>
        </DialogHeader>
        {loadingMenu ? (
          <div className="flex justify-center items-center flex-grow">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : menuError ? (
          <div className="flex flex-col justify-center items-center flex-grow text-destructive">
            <AlertTriangle className="h-8 w-8 mb-2" />
            <p>{menuError}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 p-4 flex-grow h-full overflow-y-auto no-scrollbar">
            {/* Left Column */}
            <div className="md:col-span-3 space-y-6 flex flex-col">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  id="name"
                  value={customerName}
                  onChange={handleNameChange}
                  placeholder="Customer Name"
                  className="bg-background"
                />
                <Input
                  id="phone"
                  value={customerPhone}
                  onChange={handlePhoneChange}
                  placeholder="Customer Phone"
                  type="tel"
                  className="bg-background"
                />
              </div>

              <div className="flex-grow flex flex-col overflow-hidden">
                <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full flex-grow flex flex-col overflow-hidden">
                  <TabsList className="w-full justify-start overflow-x-auto bg-transparent p-0 pb-2 flex-nowrap no-scrollbar">
                    {categories.map((cat) => (
                      <TabsTrigger key={cat} value={cat} className="flex-shrink-0">
                        {cat}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  <TabsContent value={activeCategory} className="mt-0 flex-grow overflow-hidden">
                    <ScrollArea className="h-full no-scrollbar">
                      <div className="space-y-2">
                        {filteredMenuItems.map((item: MenuItem) => {
                          const currentItem = orderItems.find(oi => oi.id === item.id);
                          const quantity = currentItem?.quantity || 0;
                          return (
                          <div key={item.id} className={cn("flex items-center justify-between p-2 rounded-md bg-background/50", item.outOfStock && "opacity-50")}>
                              <div className="flex flex-col">
                              <span>{item.name}</span>
                              {item.outOfStock && <span className="text-xs text-destructive">Out of stock</span>}
                              </div>
                              <div className="flex items-center gap-4">
                              <div className="font-mono text-sm text-green-400 flex justify-between w-20">
                                  <span>INR</span>
                                  <span>{item.price}</span>
                              </div>
                              <div className="flex items-center justify-end w-[90px] h-8">
                                  {quantity === 0 ? (
                                      <Button size="sm" className="bg-primary/20 text-primary w-full h-8 py-1" onClick={() => updateItemQuantity(item, 1)} disabled={item.outOfStock}>
                                          {item.outOfStock ? <Ban className="h-4 w-4" /> : <><Plus className="h-4 w-4 mr-1" /> Add</>}
                                      </Button>
                                  ) : (
                                      <div className="flex items-center gap-2">
                                          <Button variant="ghost" size="icon" className="h-6 w-6 text-primary" onClick={() => updateItemQuantity(item, quantity - 1)}>
                                              <Minus className="h-4 w-4" />
                                          </Button>
                                          <span className="font-bold text-center w-4">{quantity}</span>
                                          <Button variant="ghost" size="icon" className="h-6 w-6 text-primary" onClick={() => updateItemQuantity(item, quantity + 1)}>
                                              <Plus className="h-4 w-4" />
                                          </Button>
                                      </div>
                                  )}
                              </div>
                              </div>
                          </div>
                        )})}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="md:col-span-2 bg-background p-6 rounded-lg flex flex-col">
              <h3 className="text-lg font-semibold text-primary mb-4">Order Summary</h3>
              <ScrollArea className="flex-grow pr-4 -mr-4 no-scrollbar">
                {orderItems.length > 0 ? (
                  <div className="space-y-2">
                    {orderItems.map((item) => (
                      <div key={item.id} className="p-2 rounded-md bg-card">
                        <div className="flex items-start justify-between">
                          <div className="flex-grow pr-2">
                              <span>{item.name}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-muted-foreground text-xs">x{item.quantity}</span>
                              <div className="font-mono text-sm text-green-400 flex justify-between w-20">
                                  <span>INR</span>
                                  <span>{item.price * item.quantity}</span>
                              </div>
                              <Button
                              size="icon"
                              className="h-6 w-6 bg-destructive/20 text-destructive"
                              onClick={() => handleRemoveItem(item.id)}
                              >
                              <Trash2 className="h-4 w-4" />
                              </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-16 flex items-center justify-center h-full">
                    <p>No items selected.</p>
                  </div>
                )}
              </ScrollArea>
              <div className="mt-auto pt-4">
                <Separator className="my-4 bg-white/10" />
                <div className="flex justify-between items-center font-bold text-xl">
                  <span className="text-muted-foreground">Total:</span>
                  <div className="font-mono text-green-400 flex justify-between w-28">
                      <span>INR</span>
                      <span>{total}</span>
                  </div>
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitDisabled}
                  className="w-full mt-4 bg-primary/20 text-primary"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Create Order'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

    
