
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ShoppingCart, BarChart, AlertTriangle, Clock, TrendingUp } from 'lucide-react';
import type { DashboardKpis } from '@/lib/types';
import { cn } from '@/lib/utils';


// Custom INR Icon Component
const INRIcon = ({ className }: { className?: string }) => (
  <span className={className} style={{ fontSize: '1.25rem', lineHeight: '1.75rem', fontWeight: 'bold' }}>
    INR
  </span>
);


interface StatCardsProps {
  data: DashboardKpis;
}

const formatCurrency = (value: number) => {
  const formattedValue = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
  return `INR ${formattedValue}`;
};

export function StatCards({ data }: StatCardsProps) {
    const salesDiff = data.todaysSales - data.yesterdaysSales;
    const salesDiffPercent = data.yesterdaysSales > 0 ? (salesDiff / data.yesterdaysSales) * 100 : 100;

  const stats = [
    {
      title: "Today's Sales",
      value: formatCurrency(data.todaysSales),
      icon: TrendingUp,
      color: 'text-green-400',
      footer: (
        <span className="text-xs text-muted-foreground">
            {salesDiff >= 0 ? '+' : ''}{salesDiffPercent.toFixed(1)}% vs yesterday
        </span>
      )
    },
    {
      title: 'Orders Count',
      value: data.orderCounts.total,
      icon: ShoppingCart,
      color: 'text-yellow-400',
      footer: `${data.orderCounts.completed} completed, ${data.orderCounts.pending} pending`
    },
    {
      title: 'Avg. Order Value',
      value: formatCurrency(data.averageOrderValue),
      icon: BarChart,
      color: 'text-yellow-400',
      footer: `From ${data.orderCounts.total} total orders`
    },
     {
      title: 'Peak Hour',
      value: data.peakHour || 'AM/PM',
      icon: Clock,
      color: 'text-green-400',
      footer: "Today's busiest time"
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="bg-card/70 border-border flex flex-col group duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground transition-colors">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
          </CardHeader>
          <CardContent className="flex-grow p-4 pt-0">
            <div className="text-3xl font-bold text-foreground transition-colors">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1 whitespace-nowrap">
              {stat.footer}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
