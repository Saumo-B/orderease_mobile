
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { Order, FullMenuItem, AddStaffInput, AddBranchInput, UpdateBranchInput, Branch } from '@/lib/types';
import { axiosInstance } from '@/lib/axios-instance';
import { usePathname } from 'next/navigation';
import { getBranchId } from '@/lib/utils';

interface OrderContextType {
  kitchenOrders: Order[];
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
  
  // New state for centralized loading
  isPageLoading: boolean;
  branchLoading: boolean;

  // New state for branch management
  currentBranch: { id: string; name: string } | null;
  allBranches: Branch[];
  handleBranchSelect: (branch: Branch) => void;
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
  const [error, setError] = useState<string | null>(null);
  const [isAddMenuItemDialogOpen, setIsAddMenuItemDialogOpen] = useState(false);
  const [isAddIngredientDialogOpen, setIsAddIngredientDialogOpen] = useState(false);
  const [isAddStaffDialogOpen, setIsAddStaffDialogOpen] = useState(false);
  const [isAddBranchDialogOpen, setIsAddBranchDialogOpen] = useState(false);
  const pathname = usePathname();

  // Centralized loading and branch state
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [branchLoading, setBranchLoading] = useState(true);
  const [currentBranch, setCurrentBranch] = useState<{ id: string; name: string } | null>(null);
  const [allBranches, setAllBranches] = useState<Branch[]>([]);

  const fetchBranchData = useCallback(async () => {
    setBranchLoading(true);
    try {
      const storedUserProfile = localStorage.getItem('userProfile');
      const currentUserProfile = storedUserProfile ? JSON.parse(storedUserProfile) : null;
      
      const storedStaticProfile = localStorage.getItem('staticUserProfile');
      const staticProfile = storedStaticProfile ? JSON.parse(storedStaticProfile) : null;

      if (!currentUserProfile || !staticProfile) {
        setBranchLoading(false);
        return;
      }

      // Set current branch immediately for responsiveness
      setCurrentBranch({ id: currentUserProfile.branchid, name: currentUserProfile.branchName });

      if (staticProfile.branchName === 'All') {
        const response = await axiosInstance.get('/api/branch');
        if (response.data && Array.isArray(response.data)) {
          const formattedBranches: Branch[] = response.data.map((item: any) => ({
            id: item._id,
            name: item.name,
            pin: item.PIN,
            phone: item.phone,
            address: item.address,
          }));
          const sortedBranches = formattedBranches.sort((a,b) => a.name.localeCompare(b.name));
          const branchesToShow = sortedBranches.filter(b => b.name !== 'All');
          setAllBranches(branchesToShow);

          if (currentUserProfile.branchName === 'All' && branchesToShow.length > 0) {
              const defaultBranch = branchesToShow[0];
              handleBranchSelect(defaultBranch, false); // Don't reload page
          }
        }
      } else {
        // User has a specific branch, only show that
        setAllBranches([{ id: staticProfile.branchid, name: staticProfile.branchName, pin: '', phone: '', address: ''}]);
      }
    } catch (e) {
      console.error("Failed to fetch branches", e);
    } finally {
      setBranchLoading(false);
    }
  }, []);

  const handleBranchSelect = (branch: Branch, reload = true) => {
    try {
        const storedProfile = localStorage.getItem('userProfile');
        const profile = storedProfile ? JSON.parse(storedProfile) : {};
        
        const newProfile = {
            ...profile,
            branchid: branch.id,
            branchName: branch.name,
        };

        localStorage.setItem('userProfile', JSON.stringify(newProfile));
        setCurrentBranch({ id: branch.id, name: branch.name });

        if (reload) {
          window.location.reload();
        }
    } catch(e) {
        console.error("Failed to update branch selection", e);
    }
  };

  const fetchKitchenOrders = useCallback(async () => {
    setIsPageLoading(true);
    try {
      setError(null);
      const branchId = getBranchId();
      if (!branchId || branchId === '68d6fda5bab89f8afc545cee') { 
        setKitchenOrders([]);
        return;
      }
      const res = await axiosInstance.get(`/api/kitchen/today?branch=${branchId}`);
      const backendOrders = res.data.orders || [];

      const fetchedOrders: Order[] = backendOrders.map(mapBackendOrderToFrontend);

      setKitchenOrders(fetchedOrders.sort((a, b) => b.timestamp - a.timestamp));
    } catch (err) {
      console.error('Error fetching kitchen orders:', err);
      setError('Could not fetch kitchen orders. Please try again later.');
    } finally {
      setIsPageLoading(false);
    }
  }, []);
  
  useEffect(() => {
    const isAuthPage = pathname === '/kitchen/login' || pathname === '/kitchen/register' || pathname === '/';
    if (isAuthPage) {
      setIsPageLoading(false);
      setBranchLoading(false);
      return;
    }
    
    async function loadInitialData() {
      await fetchBranchData();
      await fetchKitchenOrders();
    }

    loadInitialData();

  }, [pathname, fetchBranchData, fetchKitchenOrders]);

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
        await fetchKitchenOrders();
        return true;
      } else {
        throw new Error('Failed to update order. Invalid response from server.');
      }
    } catch (error) {
      console.error(`Failed to update order ${orderId}:`, error);
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
      return true;
    } catch (error) {
      console.error(`Failed to update menu item ${menuId}:`, error);
      return false;
    }
  };

  const deleteMenuItem = async (menuId: string): Promise<boolean> => {
    try {
      await axiosInstance.delete(`/api/menu/${menuId}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete menu item ${menuId}:`, error);
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
        isPageLoading,
        branchLoading,
        currentBranch,
        allBranches,
        handleBranchSelect,
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
