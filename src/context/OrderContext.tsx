
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import type { Order, FullMenuItem, AddStaffInput, AddBranchInput, UpdateBranchInput, Branch, Ingredient, StaffMember } from '@/lib/types';
import { axiosInstance } from '@/lib/axios-instance';
import { usePathname } from 'next/navigation';
import { getBranchId } from '@/lib/utils';

interface OrderContextType {
  kitchenOrders: Order[];
  error: string | null;
  fetchKitchenOrders: () => Promise<void>;
  setKitchenOrders: React.Dispatch<React.SetStateAction<Order[]>>;

  // Global Data State
  menuItems: FullMenuItem[];
  ingredients: Ingredient[];
  staff: StaffMember[];
  fetchMenuItems: (branchId: string) => Promise<void>;
  fetchIngredients: (branchId: string) => Promise<void>;
  fetchStaff: (branchId: string) => Promise<void>;

  markAsPaid: (id: string, currentStatus: string) => Promise<boolean>;
  completeOrder: (id: string, currentStatus: string) => Promise<boolean>;
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
  setIsPageLoading: (isLoading: boolean) => void;
  branchLoading: boolean;

  // New state for branch management
  currentBranch: { id: string; name: string } | null;
  allBranches: Branch[];
  handleBranchSelect: (branch: Branch) => void;
  // Cache for menu items to prevent redundant fetches
  menuItemsCache: Record<string, FullMenuItem[]>;
  setMenuItemsCache: React.Dispatch<React.SetStateAction<Record<string, FullMenuItem[]>>>;
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
  const [menuItemsCache, setMenuItemsCache] = useState<Record<string, FullMenuItem[]>>({});

  // Internal state for global data
  const [menuItems, setMenuItems] = useState<FullMenuItem[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);

  const fetchMenuItems = useCallback(async (branchId: string) => {
    try {
      // Check if we have it in cache first to avoid flicker if already loaded
      if (menuItemsCache[branchId]) {
        setMenuItems(menuItemsCache[branchId]);
        return;
      }

      const response = await axiosInstance.get(`/api/menu?branch=${branchId}`);
      if (response.data && Array.isArray(response.data)) {
        const formatted: FullMenuItem[] = response.data.map((item: any) => {
          let imageUrl = item.imageUrl || '';
          if (imageUrl && !imageUrl.startsWith('http')) {
            imageUrl = `https://cdn.pixabay.com/photo/${imageUrl}.jpg`;
          }
          return {
            id: item._id,
            name: item.name,
            price: item.price,
            category: item.category,
            description: item.description,
            imageUrl: imageUrl,
            recipe: item.recipe,
            outOfStock: item.outOfStock,
            manualOutOfStock: item.manualOutOfStock,
          };
        });
        setMenuItems(formatted);
        setMenuItemsCache(prev => ({ ...prev, [branchId]: formatted }));
      }
    } catch (e) {
      console.error("Failed to fetch menu items", e);
    }
  }, [menuItemsCache]);

  const fetchIngredients = useCallback(async (branchId: string) => {
    try {
      const response = await axiosInstance.get(`/api/ingredients?branch=${branchId}`);
      if (response.data && Array.isArray(response.data)) {
        const formatted: Ingredient[] = response.data.map((item: any) => ({
          id: item._id,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          lowStockWarning: item.lowStockWarning,
          lowStockThreshold: item.lowStockThreshold,
        }));
        setIngredients(formatted.sort((a, b) => a.name.localeCompare(b.name)));
      }
    } catch (e) {
      console.error("Failed to fetch ingredients", e);
    }
  }, []);

  const fetchStaff = useCallback(async (branchId: string) => {
    try {
      const response = await axiosInstance.get(`/api/profiles?branch=${branchId}`);
      if (response.data && Array.isArray(response.data.staff)) {
        const formatted: StaffMember[] = response.data.staff.map((item: any) => ({
          id: item._id,
          name: item.name,
          email: item.email,
          role: item.role,
        }));
        setStaff(formatted);
      }
    } catch (e) {
      console.error("Failed to fetch staff", e);
    }
  }, []);

  const fetchBranchData = useCallback(async () => {
    // setBranchLoading(true); // Optimization: Don't block UI on refetch
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
          const sortedBranches = formattedBranches.sort((a, b) => a.name.localeCompare(b.name));
          const branchesToShow = sortedBranches.filter(b => b.name !== 'All');
          setAllBranches(branchesToShow);

          if (currentUserProfile.branchName === 'All' && branchesToShow.length > 0) {
            const defaultBranch = branchesToShow[0];
            handleBranchSelect(defaultBranch, false); // Don't reload page
          }
        }
      } else {
        // User has a specific branch, only show that
        setAllBranches([{ id: staticProfile.branchid, name: staticProfile.branchName, pin: '', phone: '', address: '' }]);
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
    } catch (e) {
      console.error("Failed to update branch selection", e);
    }
  };

  const fetchKitchenOrders = useCallback(async () => {
    // We do not set isPageLoading(true) here to allow for background updates without skeletons
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
    }
  }, []);

  const [lastLoadedBranchId, setLastLoadedBranchId] = useState<string | null>(null);

  // Polling for kitchen orders
  /*
  useEffect(() => {
    if (!currentBranch) return;

    const pollInterval = setInterval(() => {
      // Silent fetch
      const branchId = getBranchId();
      if (branchId) {
        axiosInstance.get(`/api/kitchen/today?branch=${branchId}`)
          .then(res => {
            const backendOrders = res.data.orders || [];
            const fetchedOrders: Order[] = backendOrders.map(mapBackendOrderToFrontend);
            // Compare length or token hash to avoid unnecessary state updates if needed, 
            // but for now react handles diffing reasonably well if simple.
            setKitchenOrders(fetchedOrders.sort((a, b) => b.timestamp - a.timestamp));
          })
          .catch(err => console.error("Polling error", err));
      }
    }, 10000); // 10 seconds

    return () => clearInterval(pollInterval);
  }, [currentBranch]);
  */

  useEffect(() => {
    const isAuthPage = pathname === '/kitchen/login' || pathname === '/kitchen/register' || pathname === '/';
    if (isAuthPage) {
      setIsPageLoading(false);
      setBranchLoading(false);
      return;
    }

    async function loadInitialData() {
      // Avoid reloading if we already have data for this branch
      const branchId = getBranchId();
      if (branchId === lastLoadedBranchId) {
        // Data is already loaded for this branch.
        setIsPageLoading(false);
        setBranchLoading(false);
        return;
      }

      setBranchLoading(true); // Critical phase start
      try {
        await fetchBranchData();
      } catch (e) {
        console.error("Branch fetch failed", e);
      } finally {
        setBranchLoading(false); // Critical phase end
      }

      setIsPageLoading(true); // Content phase start

      try {
        // Re-read branch ID after fetchBranchData
        const currentBranchId = getBranchId();
        const promises: Promise<void>[] = [fetchKitchenOrders()];

        if (currentBranchId && currentBranchId !== '68d6fda5bab89f8afc545cee') {
          promises.push(fetchMenuItems(currentBranchId));
          promises.push(fetchIngredients(currentBranchId));
          promises.push(fetchStaff(currentBranchId));
        }

        await Promise.all(promises);
        setLastLoadedBranchId(currentBranchId);

      } catch (err) {
        console.error("Error loading initial data:", err);
      } finally {
        setIsPageLoading(false); // Content phase end
      }
    }

    loadInitialData();

  }, [fetchBranchData, fetchKitchenOrders, fetchMenuItems, fetchIngredients, fetchStaff, lastLoadedBranchId]);



  const completeOrder = useCallback(async (id: string, currentStatus: string): Promise<boolean> => {
    try {
      // If already paid, marking as served completes it ('done').
      // Otherwise, just mark as 'served'.
      const newStatus = currentStatus === 'paid' ? 'done' : 'served';

      const res = await axiosInstance.patch(
        `/api/kitchen/status/${id}`,
        { status: newStatus }
      );

      if (res.status === 200 && res.data.order) {
        // Optimistically update or wait for refetch (refetch is safer for order movement)
        const updatedOrder = mapBackendOrderToFrontend(res.data.order);
        setKitchenOrders(prevOrders =>
          prevOrders.map(o => o.id === updatedOrder.id ? updatedOrder : o)
            .sort((a, b) => b.timestamp - a.timestamp)
        );
        return true;
      } else {
        throw new Error('Backend update failed');
      }
    } catch (error) {
      console.error(`Failed to complete order ${id}:`, error);
      return false;
    }
  }, []);

  const markAsPaid = useCallback(async (id: string, currentStatus: string): Promise<boolean> => {
    try {
      // If already served, marking as paid completes it ('done').
      // Otherwise, just mark as 'paid'.
      const newStatus = currentStatus === 'served' ? 'done' : 'paid';

      const res = await axiosInstance.patch(
        `/api/kitchen/status/${id}`,
        { status: newStatus }
      );

      if (res.status === 200 && res.data.order) {
        const updatedOrder = mapBackendOrderToFrontend(res.data.order);
        setKitchenOrders(prevOrders =>
          prevOrders.map(o => o.id === updatedOrder.id ? updatedOrder : o)
            .sort((a, b) => b.timestamp - a.timestamp)
        );
        return true;
      } else {
        throw new Error('Backend update failed');
      }
    } catch (error) {
      console.error(`Failed to mark order ${id} as paid:`, error);
      return false;
    }
  }, []);

  const updateOrderItems = useCallback(async (orderId: string, customer: { name: string, phone: string }, items: { menuItem: string, qty: number, price: number, served: boolean, initialQty: number }[]): Promise<boolean> => {
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
  }, [fetchKitchenOrders]);

  const cancelOrder = useCallback(async (orderId: string): Promise<boolean> => {
    try {
      const res = await axiosInstance.delete(
        `/api/orders/${orderId}`
      );

      if (res.status === 200) {
        setKitchenOrders(prevOrders =>
          prevOrders.filter((order) => order.id !== orderId)
        );
        return true;
      } else {
        throw new Error('Backend returned an error');
      }
    } catch (error) {
      console.error(`Failed to cancel order ${orderId}:`, error);
      return false;
    }
  }, []);

  const deleteIngredient = useCallback(async (ingredientId: string): Promise<boolean> => {
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
      if (error.response && error.response.status === 409) {
        console.error(`Ingredient ${ingredientId} is in use.`);
        return false;
      }
      console.error(`Failed to delete ingredient ${ingredientId}:`, error);
      return false;
    }
  }, []);

  const updateMenuItem = useCallback(async (menuId: string, data: Partial<FullMenuItem>): Promise<boolean> => {
    try {
      await axiosInstance.patch(`/api/menu/${menuId}`, data);
      return true;
    } catch (error) {
      console.error(`Failed to update menu item ${menuId}:`, error);
      return false;
    }
  }, []);

  const deleteMenuItem = useCallback(async (menuId: string): Promise<boolean> => {
    try {
      await axiosInstance.delete(`/api/menu/${menuId}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete menu item ${menuId}:`, error);
      return false;
    }
  }, []);

  const addStaffMember = useCallback(async (staffData: AddStaffInput): Promise<boolean> => {
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
  }, []);

  const addBranch = useCallback(async (branchData: AddBranchInput): Promise<boolean> => {
    try {
      await axiosInstance.post('/api/branch', branchData);
      return true;
    } catch (error) {
      console.error('Failed to add branch:', error);
      return false;
    }
  }, []);

  const updateBranch = useCallback(async (branchId: string, branchData: UpdateBranchInput): Promise<boolean> => {
    try {
      await axiosInstance.put(`/api/branch/${branchId}`, branchData);
      return true;
    } catch (error) {
      console.error(`Failed to update branch ${branchId}:`, error);
      return false;
    }
  }, []);

  const contextValue = useMemo(() => ({
    kitchenOrders,
    error,
    setKitchenOrders,
    fetchKitchenOrders,
    menuItems,
    ingredients,
    staff,
    fetchMenuItems,
    fetchIngredients,
    fetchStaff,
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
    setIsPageLoading,
    branchLoading,
    currentBranch,
    allBranches,
    handleBranchSelect,
    menuItemsCache,
    setMenuItemsCache,
  }), [
    kitchenOrders,
    error,
    menuItems,
    ingredients,
    staff,
    fetchKitchenOrders,
    fetchMenuItems,
    fetchIngredients,
    fetchStaff,
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
    isAddIngredientDialogOpen,
    isAddStaffDialogOpen,
    isAddBranchDialogOpen,
    isPageLoading,
    branchLoading,
    currentBranch,
    allBranches,
    handleBranchSelect,
    menuItemsCache // State setters like setIs... are stable and don't need to be in deps but can be
  ]);

  return (
    <OrderContext.Provider value={contextValue}>
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
