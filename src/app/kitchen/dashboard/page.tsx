
'use client';

import { StatCards } from '@/components/dashboard/StatCards';
import { SalesChart } from '@/components/dashboard/SalesChart';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { DashboardData } from '@/lib/types';
import { OrdersSnapshot } from '@/components/dashboard/OrdersSnapshot';
import { InventorySnapshot } from '@/components/dashboard/InventorySnapshot';
import { axiosInstance } from '@/lib/axios-instance';
import { getBranchId } from '@/lib/utils';
import { useOrder } from '@/context/OrderContext';

const FEATURE_FLAGS_KEY = 'featureFlags';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInventorySnapshot, setShowInventorySnapshot] = useState(true);
  const { loading: ordersLoading } = useOrder();

  useEffect(() => {
    // Feature flag for inventory snapshot
    try {
        const storedFlags = localStorage.getItem(FEATURE_FLAGS_KEY);
        if (storedFlags) {
            const flags = JSON.parse(storedFlags);
            setShowInventorySnapshot(flags['dashboard.inventory_snapshot'] ?? true);
        }
    } catch (e) {
        console.error("Failed to read feature flags", e);
    }


    async function fetchData() {
      try {
        const branchId = getBranchId();
        if (!branchId) {
            throw new Error("Branch ID not found. Please log in again.");
        }
        const response = await axiosInstance.get(
          `/api/kitchen/dashboard-stats`,
          { params: { branch: branchId } }
        );
        const apiData = response.data;
        
        // The backend now provides all necessary data, so we map it directly.
        // But we calculate peak hour from the sales data.
        const peakHourData = apiData.salesTodayByHour.reduce(
          (max: { revenue: number, hour: string }, hourData: { revenue: number, hour: string }) => 
            hourData.revenue > max.revenue ? hourData : max, 
            { revenue: -1, hour: '' }
        );

        setData({
          kpis: { ...apiData.kpis, peakHour: peakHourData.hour },
          salesTodayByHour: apiData.salesTodayByHour,
          salesYesterdayByHour: apiData.salesYesterdayByHour,
          lowStockItems: apiData.lowStockItems,
        });

        setStatsLoading(false);
      } catch (err: any) {
        console.error('Failed to fetch dashboard data:', err);
        setError(err.message || 'Could not load dashboard data. Please try again later.');
        setStatsLoading(false);
      }
    }
    fetchData();
  }, []);
  
  const isLoading = statsLoading || ordersLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 bg-destructive/10 text-destructive rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16 bg-card rounded-lg">
        <p className="text-muted-foreground">No dashboard data available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StatCards data={data.kpis} />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
           <SalesChart todayData={data.salesTodayByHour} yesterdayData={data.salesYesterdayByHour} />
        </div>
        <div className="h-full flex flex-col gap-6">
           <OrdersSnapshot />
           {showInventorySnapshot && <InventorySnapshot lowStockItems={data.lowStockItems} />}
        </div>
      </div>
    </div>
  );
}
