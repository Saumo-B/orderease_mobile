
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

// This interface is used when adding items to the cart on the frontend.
export interface CartItem extends MenuItem {
  quantity: number;
}

// This interface now more closely matches the line items from the backend.
export interface OrderItem {
    id: string; // was not present, but good for react keys
    name: string; // mapped from 'sku' or 'name'
    quantity: number; // mapped from 'qty' or 'active' + 'served'
    price: number;
    served: boolean; // Is at least one item served?
    active: number;
    servedQty: number;
    menuItem?: { // Can be populated from backend
      _id: string;
      name: string;
    }
}


// This interface now matches the structure from the backend API response.
export interface Order {
  id: string; // mapped from '_id'
  token: string; // mapped from 'orderToken'
  items: OrderItem[]; // mapped from 'lineItems'
  customerName: string; // mapped from 'customer.name'
  customerPhone: string; // mapped from 'customer.phone'
  total: number; // mapped from 'amount'
  amountDue: number; // mapped from 'amountDue'
  timestamp: number; // mapped from 'createdAt'
  status: 'new' | 'paid' | 'done' | 'served'; // mapped from 'status'
  served: boolean; // mapped from 'served'
}

// Types for Inventory Page
export interface Ingredient {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    lowStockThreshold?: number;
    lowStockWarning?: boolean;
}

// Type for Menu Management
export interface RecipeItem {
  ingredient: string; // Ingredient ID
  qtyRequired: number;
}

// This is the populated version from the detailed GET /api/menu/:id call
export interface PopulatedRecipeItem {
  ingredient: {
    _id: string;
    name: string;
    unit: string;
    quantity: number;
  },
  qtyRequired: number;
}

export interface FullMenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  imageUrl: string;
  recipe: RecipeItem[];
}

// Types for Roles / Staff Management
export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'manager' | 'chef' | 'waiter';
}

export interface AddStaffInput {
  name: string;
  email: string;
  password?: string;
  role: 'owner' | 'manager' | 'chef' | 'waiter';
}

// Types for Branch Management
export interface Branch {
  id: string;
  name: string;
  pin: string;
  phone: string;
  address: string;
}

export interface AddBranchInput {
    name: string;
    PIN: string;
    phone: string;
    address: string;
}

export interface UpdateBranchInput extends AddBranchInput {}


// --- DASHBOARD TYPES ---
export interface DashboardKpis {
  todaysSales: number;
  yesterdaysSales: number;
  orderCounts: {
    total: number;
    completed: number;
    pending: number;
    cancelled: number;
  };
  averageOrderValue: number;
  lowStockItemCount: number;
  peakHour: string;
}

export interface DashboardData {
    kpis: DashboardKpis;
    salesTodayByHour: { hour: string; revenue: number }[];
    salesYesterdayByHour: { hour: string; revenue: number }[];
    lowStockItems: { name: string; quantity: number; unit: string }[];
}


// --- SALES REPORT TYPES ---
export interface SalesReportSummary {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
}

export interface SalesTrendDataPoint {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface SalesReportOrder {
  id: string;
  token: string;
  date: string;
  customerName: string;
  total: number;
  status: 'new' | 'paid' | 'done' | 'served';
}

// This is the new comprehensive type for the entire sales report API response.
export interface FullSalesReportData {
  summary: SalesReportSummary;
  salesTrend: SalesTrendDataPoint[];
  itemAnalysis: {
    topSellingItems: { name: string; quantity: number; revenue: number }[];
  };
  customerInsights: {
    newVsReturning: { new: number; returning: number };
    highSpendersCount: number;
  };
  paymentMethods: { method: string; count: number }[];
  detailedOrders: SalesReportOrder[];
}
