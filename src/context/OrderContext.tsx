
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { Order, FullMenuItem, AddStaffInput, AddBranchInput, UpdateBranchInput } from '@/lib/types';
import { axiosInstance } from '@/lib/axios-instance';
import { usePathname } from 'next/navigation';
import { getBranchId } from '@/lib/utils';

interface OrderContextType {
  kitchenOrders: Order[];
  loading: boolean; // For kitchen orders
  error: string | null;
  fetchKitchenOrders: () => Promise<void>;
  setKitchenOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  markAsPaid: (id: string) => Promise<boolean>;
  completeOrder: (id: string) => Promise<boolean>;
  cancelOrder: (id: string) => Promise<boolean>;
  updateOrderItems: (orderId: string, customer: { name: string, phone: string }, items: { menuItem: string, qty: number, price: number, served: boolean, initialQty: number }[]) => Promise<boolean>;
  deleteIngredient: (ingredientId: string) => Promise<boolean>;
  updateMenuItem: (menuId: string, data: Partial<FullMenuItem>) => Promise<boolean>;
  deleteMenuItem: (menuId: string) => Promise<boolean>;
  addStaffMember: (staffData: AddStaffInput) => Promise<boolean>;
  addBranch: (branchData: AddBranchInput) => Promise<boolean>;
  updateBranch: (branchId: string, branchData: UpdateBranchInput) => Promise<boolean>;
  isAddMenuItemDialogOpen: boolean;
  setIsAddMenuItemDialogOpen: (isOpen: boolean) => void;
  isAddIngredientDialogOpen: boolean;
  setIsAddIngredientDialogOpen: (isOpen: boolean) => void;
  isAddStaffDialogOpen: boolean;
  setIsAddStaffDialogOpen: (isOpen: boolean) => void;
  isAddBranchDialogOpen: boolean;
  setIsAddBranchDialogOpen: (isOpen: boolean) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Helper function to map backend order structure to frontend Order type
const mapBackendOrderToFrontend = (order: any): Order => {
  return {
    id: order._id,
    token: order.orderToken,
    customerName: order.customer?.name || '',
    customerPhone: order.customer?.phone || '',
    total: order.amount,
    amountDue: order.amountDue,
    status: order.status === 'created' ? 'new' : order.status,
    timestamp: new Date(order.createdAt).getTime(),
    items: order.lineItems.map((item: any) => {
      const activeQty = item.status?.active ?? item.active ?? 0;
      const servedQty = item.status?.served ?? item.served ?? 0;
      const quantity = activeQty + servedQty;
      const isServed = servedQty > 0;
      
      return {
        id: item._id || item.menuItem?._id || item.name || 'unknown-id',
        name: item.name || item.menuItem?.name || item.sku || 'Unknown Item',
        quantity: quantity,
        price: item.price,
        served: isServed,
        active: activeQty,
        servedQty: servedQty,
        menuItem: item.menuItem,
      };
    }),
    served: order.served || false,
  };
};


export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [kitchenOrders, setKitchenOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddMenuItemDialogOpen, setIsAddMenuItemDialogOpen] = useState(false);
  const [isAddIngredientDialogOpen, setIsAddIngredientDialogOpen] = useState(false);
  const [isAddStaffDialogOpen, setIsAddStaffDialogOpen] = useState(false);
  const [isAddBranchDialogOpen, setIsAddBranchDialogOpen] = useState(false);
  const pathname = usePathname();


  const fetchKitchenOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const branchId = getBranchId();
      if (!branchId) {
        // We can choose to throw an error, or just not fetch.
        // For now, we will not fetch, and the UI will show no orders.
        setKitchenOrders([]);
        console.warn("No branch ID found, cannot fetch kitchen orders.");
        return;
      }
      const res = await axiosInstance.get(
        `/api/kitchen/today?branch=${branchId}`
      );
      const backendOrders = res.data.orders || [];

      const fetchedOrders: Order[] = backendOrders.map(mapBackendOrderToFrontend);

      setKitchenOrders(fetchedOrders.sort((a, b) => b.timestamp - a.timestamp));
    } catch (err) {
      console.error('Error fetching kitchen orders:', err);
      setError('Could not fetch kitchen orders. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    const isKitchenPage = pathname.startsWith('/kitchen');
    const isAuthPage = pathname === '/kitchen/login' || pathname === '/kitchen/register';
    const kitchenPagesThatNeedOrders = ['/kitchen', '/kitchen/dashboard'];


    if (isKitchenPage && !isAuthPage && kitchenPagesThatNeedOrders.includes(pathname)) {
      fetchKitchenOrders();
    } else {
      setLoading(false);
    }
  }, [fetchKitchenOrders, pathname]);

 const completeOrder = async (id: string): Promise<boolean> => {
    try {
      const res = await axiosInstance.patch(
        `/api/kitchen/status/${id}`,
        { status: 'served' }
      );

      if (res.status === 200 && res.data.order) {
        const updatedOrder = mapBackendOrderToFrontend(res.data.order);
        
        const updateState = (prevOrders: Order[]) => 
            prevOrders.map(o => o.id === updatedOrder.id ? updatedOrder : o)
                      .sort((a, b) => b.timestamp - a.timestamp);

        setKitchenOrders(updateState);
        
        return true;
      } else {
        throw new Error('Backend update failed');
      }
    } catch (error) {
      console.error(`Failed to complete order ${id}:`, error);
      return false;
    }
  };

  const markAsPaid = async (id: string): Promise<boolean> => {
    try {
      const res = await axiosInstance.patch(
        `/api/kitchen/status/${id}`,
        { status: 'paid' }
      );

      if (res.status === 200 && res.data.order) {
        const updatedOrder = mapBackendOrderToFrontend(res.data.order);
        
        const updateState = (prevOrders: Order[]) => 
            prevOrders.map(o => o.id === updatedOrder.id ? updatedOrder : o)
                      .sort((a,b) => b.timestamp - a.timestamp);

        setKitchenOrders(updateState);
        
        return true;
      } else {
        throw new Error('Backend update failed');
      }
    } catch (error) {
      console.error(`Failed to mark order ${id} as paid:`, error);
      // Removed toast
      return false;
    }
  };
  
  const updateOrderItems = async (orderId: string, customer: { name: string, phone: string }, items: { menuItem: string, qty: number, price: number, served: boolean, initialQty: number }[]): Promise<boolean> => {
    try {
       const itemsPayload = items.map(item => {
        const servedQty = item.served ? item.initialQty : 0;
        const activeQty = item.qty - servedQty;
        return {
          menuItem: item.menuItem,
          price: item.price,
          status: {
            active: activeQty,
            served: servedQty,
          }
        }
      });

      const payload = {
        items: itemsPayload,
        customer,
      };
      
      const res = await axiosInstance.patch(
        `/api/orders/${orderId}`,
        payload
      );

      if (res.status === 200 && res.data.order) {
        // We can just refetch all orders to get the latest state
        await fetchKitchenOrders();
        return true;
      } else {
        throw new Error('Failed to update order. Invalid response from server.');
      }
    } catch (error) {
      console.error(`Failed to update order ${orderId}:`, error);
       // Removed toast
      return false;
    }
  };

  const cancelOrder = async (orderId: string): Promise<boolean> => {
    try {
      const res = await axiosInstance.delete(
        `/api/orders/${orderId}`
      );

      if (res.status === 200) {
        const filterOutOrder = (prevOrders: Order[]) => 
          prevOrders.filter((order) => order.id !== orderId);

        setKitchenOrders(filterOutOrder);
        
        return true;
      } else {
        throw new Error('Backend returned an error');
      }
    } catch (error) {
      console.error(`Failed to cancel order ${orderId}:`, error);
      // Removed toast
      return false;
    }
  };

  const deleteIngredient = async (ingredientId: string): Promise<boolean> => {
    try {
      const branchId = getBranchId();
      if (!branchId) {
        throw new Error("Branch ID not found. Please log in again.");
      }
      const response = await axiosInstance.delete(`/api/ingredients/${ingredientId}?branch=${branchId}`);
       if (response.status === 409) {
          return false;
       }
      return true;
    } catch (error: any) {
        if(error.response && error.response.status === 409) {
            console.error(`Ingredient ${ingredientId} is in use.`);
            return false;
        }
      console.error(`Failed to delete ingredient ${ingredientId}:`, error);
      return false;
    }
  };

  const updateMenuItem = async (menuId: string, data: Partial<FullMenuItem>): Promise<boolean> => {
    try {
      await axiosInstance.patch(`/api/menu/${menuId}`, data);
      // Removed toast
      return true;
    } catch (error) {
      console.error(`Failed to update menu item ${menuId}:`, error);
      // Removed toast
      return false;
    }
  };

  const deleteMenuItem = async (menuId: string): Promise<boolean> => {
    try {
      await axiosInstance.delete(`/api/menu/${menuId}`);
      // Removed toast
      return true;
    } catch (error) {
      console.error(`Failed to delete menu item ${menuId}:`, error);
      // Removed toast
      return false;
    }
  };

  const addStaffMember = async (staffData: AddStaffInput): Promise<boolean> => {
    try {
      const branchId = getBranchId();
      if (!branchId) {
        throw new Error("Branch ID not found. Please log in again.");
      }
      await axiosInstance.post(`/api/register?branch=${branchId}`, staffData);
      return true;
    } catch (error) {
      console.error('Failed to add staff member:', error);
      return false;
    }
  };
  
  const addBranch = async (branchData: AddBranchInput): Promise<boolean> => {
    try {
        await axiosInstance.post('/api/branch', branchData);
        return true;
    } catch(error) {
        console.error('Failed to add branch:', error);
        return false;
    }
  };
  
  const updateBranch = async (branchId: string, branchData: UpdateBranchInput): Promise<boolean> => {
     try {
        await axiosInstance.put(`/api/branch/${branchId}`, branchData);
        return true;
    } catch(error) {
        console.error(`Failed to update branch ${branchId}:`, error);
        return false;
    }
  };


  return (
    <OrderContext.Provider
      value={{
        kitchenOrders,
        loading,
        error,
        setKitchenOrders,
        fetchKitchenOrders,
        completeOrder,
        markAsPaid,
        cancelOrder,
        updateOrderItems,
        deleteIngredient,
        updateMenuItem,
        deleteMenuItem,
        addStaffMember,
        addBranch,
        updateBranch,
        isAddMenuItemDialogOpen,
        setIsAddMenuItemDialogOpen,
        isAddIngredientDialogOpen,
        setIsAddIngredientDialogOpen,
        isAddStaffDialogOpen,
        setIsAddStaffDialogOpen,
        isAddBranchDialogOpen,
        setIsAddBranchDialogOpen,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};
