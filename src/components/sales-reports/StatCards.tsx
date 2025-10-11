
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';
import type { SalesReportSummary } from '@/lib/types';


const INRIcon = ({ className }: { className?: string }) => (
  <span className={className} style={{ fontSize: '1rem', lineHeight: '1.5rem', fontWeight: 'bold' }}>
    INR
  </span>
);


interface StatCardsProps {
  data: SalesReportSummary;
}

const formatCurrency = (value: number) => {
  const formattedValue = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
  return `INR ${formattedValue}`;
};

export function SalesReportStatCards({ data }: StatCardsProps) {
  const stats = [
    {
      title: 'Total Revenue',
      value: formatCurrency(data.totalRevenue),
      icon: INRIcon,
      color: 'text-green-400',
    },
    {
      title: 'Total Orders',
      value: data.totalOrders.toLocaleString('en-IN'),
      icon: ShoppingCart,
      color: 'text-yellow-400',
    },
    {
      title: 'Avg. Order Value',
      value: formatCurrency(data.averageOrderValue),
      icon: INRIcon,
      color: 'text-green-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat) => (
        <Card key={stat.title} className="bg-card/70 border-white/10 shadow-lg duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/70">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white transition-colors">{stat.value}</div>
             <p className="text-xs text-muted-foreground mt-1">
              For selected period
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
