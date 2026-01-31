
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
      color: 'text-primary',
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
      color: 'text-primary',
      footer: `${data.orderCounts.completed} completed, ${data.orderCounts.pending} pending`
    },
    {
      title: 'Avg. Order Value',
      value: formatCurrency(data.averageOrderValue),
      icon: BarChart,
      color: 'text-primary',
      footer: `From ${data.orderCounts.total} total orders`
    },
    {
      title: 'Peak Hour',
      value: data.peakHour || 'AM/PM',
      icon: Clock,
      color: 'text-primary',
      footer: "Today's busiest time"
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="glass-card border-white/5 flex flex-col group duration-300 hover:shadow-glow hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-5 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg bg-white/5 ${stat.color.replace('text-', 'text-opacity-80 text-')}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent className="flex-grow p-5 pt-1">
            <div className="text-3xl font-black text-foreground transition-colors tracking-tight">{stat.value}</div>
            <p className="text-xs text-muted-foreground/60 mt-2 whitespace-nowrap font-medium">
              {stat.footer}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
