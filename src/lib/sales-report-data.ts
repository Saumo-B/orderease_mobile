
// This file is now deprecated as we are fetching live data from the backend.
// It is kept for reference but is no longer used by the application.

import { SalesReportData } from './types';

function generateSalesTrend(days: number) {
  const trend = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    trend.push({
      date: date.toISOString().split('T')[0],
      revenue: Math.floor(Math.random() * (8000 - 2000 + 1)) + 2000,
    });
  }
  return trend;
}

function generateOrders(count: number) {
    const orders = [];
    const statuses: ('new' | 'paid' | 'done' | 'served')[] = ['new', 'paid', 'done', 'served'];
    for (let i = 0; i < count; i++) {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));
        orders.push({
            id: `ORD${1000 + i}`,
            token: `${101 + i}`,
            date: date.toISOString(),
            customerName: `Customer ${i + 1}`,
            total: Math.floor(Math.random() * 500) + 50,
            status: statuses[Math.floor(Math.random() * statuses.length)],
        });
    }
    return orders.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}


export const salesReportData: SalesReportData = {
  summary: {
    totalRevenue: 150500,
    totalOrders: 450,
    averageOrderValue: 334.44,
  },
  salesTrend: generateSalesTrend(30),
  orders: generateOrders(50),
};
