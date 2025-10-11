
'use client';

import { Bar, ComposedChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Line } from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { SalesTrendDataPoint } from '@/lib/types';


interface SalesChartProps {
  data: SalesTrendDataPoint[];
}

export function SalesReportChart({ data }: SalesChartProps) {

  const chartConfig = {
    revenue: {
      label: 'Revenue',
      color: '#22d3ee', // Cyan-400
    },
    orderCount: {
      label: 'Orders',
      color: '#facc15', // yellow-400
    },
     aov: {
      label: 'AOV',
      color: 'hsl(var(--chart-3))',
    },
  };

  return (
    <Card className="group bg-card/70 border-white/10 shadow-lg h-full duration-300">
      <CardHeader>
        <CardTitle className="text-white group-hover:text-cyan-400 transition-colors">Revenue Trends</CardTitle>
        <CardDescription>Revenue, orders, and average order value over time.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ChartContainer config={chartConfig} className="w-full h-full">
            <ComposedChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis
                yAxisId="left"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `INR ${value / 1000}k`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: 'hsla(var(--muted), 0.2)' }}
                content={<ChartTooltipContent
                    formatter={(value, name) => {
                         const formattedValue = name === 'revenue' || name === 'aov'
                            ? `INR ${Number(value).toLocaleString()}`
                            : Number(value).toLocaleString();
                         return (
                             <div>
                                <p className='font-semibold capitalize'>{chartConfig[name as keyof typeof chartConfig]?.label || name}</p>
                                <p>{formattedValue}</p>
                            </div>
                         )
                    }}
                    labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    indicator="dot"
                />}
              />
              <defs>
                 <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartConfig.revenue.color} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={chartConfig.revenue.color} stopOpacity={0.1}/>
                 </linearGradient>
              </defs>
              <Bar yAxisId="left" dataKey="revenue" fill="url(#colorRevenue)" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="orderCount" stroke={chartConfig.orderCount.color} strokeWidth={2} dot={false} />
            </ComposedChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
