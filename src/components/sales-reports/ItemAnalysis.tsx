
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface ItemAnalysisProps {
  data: { name: string; quantity: number; revenue: number }[];
}

export function ItemAnalysis({ data }: ItemAnalysisProps) {
  
  const chartConfig = {
    quantity: {
      label: 'Quantity Sold',
      color: 'hsl(var(--primary))',
    },
    revenue: {
      label: 'Revenue',
       color: 'hsl(var(--chart-2))',
    }
  };

  return (
    <Card className="group bg-card/70 border-border h-full duration-300">
      <CardHeader>
        <CardTitle className="text-foreground group-hover:text-primary transition-colors">Top-Selling Items</CardTitle>
        <CardDescription>Your most popular menu items by quantity sold.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[450px]">
           <ChartContainer config={chartConfig} className="w-full h-full">
             <ResponsiveContainer>
                <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
                  <defs>
                    <linearGradient id="colorQuantity" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="5%" stopColor={chartConfig.quantity.color} stopOpacity={0.1}/>
                      <stop offset="95%" stopColor={chartConfig.quantity.color} stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={80} 
                    tickLine={false} 
                    axisLine={false} 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                   />
                   <Tooltip
                    cursor={{ fill: 'hsla(var(--muted), 0.2)' }}
                    content={<ChartTooltipContent
                        formatter={(value, name) => (
                             <div>
                                <p className='font-semibold capitalize'>{chartConfig[name as keyof typeof chartConfig].label}</p>
                                <p>{name === 'revenue' ? `INR ${Number(value).toLocaleString()}` : Number(value).toLocaleString()}</p>
                            </div>
                        )}
                        indicator="dot"
                    />}
                  />
                  <Bar dataKey="quantity" fill="url(#colorQuantity)" radius={[0, 4, 4, 0]} />
                </BarChart>
            </ResponsiveContainer>
           </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
