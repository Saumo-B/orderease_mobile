
'use server';
/**
 * @fileOverview A flow for managing restaurant orders.
 *
 * - createOrder - Creates a new order from cart items and customer details.
 * - getOrders - Retrieves all existing orders.
 * - getOrder - Retrieves a single order by its token.
 * - CreateOrderInput - The input type for the createOrder function.
 * - Order - The data type for a single order.
 */

import type { CartItem, Order, MenuItem } from '@/lib/types';
import { axiosInstance } from '@/lib/axios-instance';

// The input type for the createOrder function.
export interface CreateOrderInput {
  items: CartItem[];
  customerName: string;
  customerPhone: string;
  total: number;
}


/**
 * Creates a new order and saves it.
 * This is now a mock function as order creation is handled by an external backend.
 * @param input - The details of the order to be created.
 * @returns A mock order response.
 */
export async function createOrder(input: CreateOrderInput): Promise<Order> {
  // This function is no longer called by the main application flow,
  // but is kept for potential future use or testing.
  const mockOrder: Order = {
    id: 'MOCK_ID',
    token: 'MOCK',
    ...input,
    timestamp: Date.now(),
    status: 'new',
  };
  return mockOrder;
}

/**
 * Retrieves all orders from the backend.
 * @returns A promise that resolves to an array of all orders.
 */
export async function getOrders(): Promise<Order[]> {
    try {
        const res = await axiosInstance.get(`/api/orders`);
        return res.data.orders as Order[];
    } catch (err) {
        console.error("Error fetching orders:", err);
        return [];
    }
}

/**
 * Retrieves a single order by its token from the backend.
 * @param token The token of the order to retrieve.
 * @returns A promise that resolves to the order or null if not found.
 */
export async function getOrder(token: string): Promise<Order | null> {
    try {
        const res = await axiosInstance.get(`/api/orders/${token}`);
        return res.data.order as Order;
    } catch (err) {
        console.error(`Error fetching order ${token}:`, err);
        return null;
    }
}
