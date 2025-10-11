
export const dashboardData = {
  todayStats: {
    totalRevenue: 15500,
    totalOrders: 75,
    averageOrderValue: 206.67,
  },
  salesByHour: [
    { hour: '9am', revenue: 800 },
    { hour: '10am', revenue: 1200 },
    { hour: '11am', revenue: 1500 },
    { hour: '12pm', revenue: 2500 },
    { hour: '1pm', revenue: 3000 },
    { hour: '2pm', revenue: 2000 },
    { hour: '3pm', revenue: 1800 },
    { hour: '4pm', revenue: 1500 },
    { hour: '5pm', revenue: 1200 },
  ],
  topSellingItems: [
    { name: 'Burger', count: 45 },
    { name: 'Pizza', count: 30 },
    { name: 'Fried Chicken', count: 25 },
    { name: 'Momo', count: 20 },
    { name: 'Noodles', count: 15 },
  ],
  orderStatusCounts: [
    { status: 'new', count: 5 },
    { status: 'paid', count: 12 },
    { status: 'served', count: 8 },
    { status: 'done', count: 50 },
  ],
};
