
'use client';

import { Bar, ComposedChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Line, BarChart } from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { PackageOpen } from 'lucide-react';


interface SalesChartProps {
  todayData: { hour: string; revenue: number }[];
  yesterdayData: { hour: string; revenue: number }[];
}


export function SalesChart({ todayData, yesterdayData }: SalesChartProps) {
  
  const combinedData = todayData.map((today, index) => ({
    hour: today.hour,
    today: today.revenue,
    yesterday: yesterdayData[index]?.revenue || 0,
  }));
  
  const chartConfig = {
    today: {
      label: 'Today',
      color: 'hsl(var(--primary))',
    },
    yesterday: {
      label: 'Yesterday',
      color: 'hsl(var(--muted-foreground))',
    },
  };
  
  const hasData = combinedData.some(d => d.today > 0 || d.yesterday > 0);

  const cardComponent = (
     <Card className="bg-card/70 border-white/10 shadow-lg h-full group duration-300 cursor-pointer flex flex-col">
        <CardHeader>
        <div className="flex justify-between items-center">
            <div>
            <CardTitle className="text-white transition-colors">Live Sales Overview</CardTitle>
            <CardDescription>Today vs. Yesterday</CardDescription>
            </div>
            <BarChart className="h-5 w-5 text-destructive" />
        </div>
        </CardHeader>
        <CardContent className="flex-grow flex items-end">
        {hasData ? (
            <div className="w-full h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={combinedData} margin={{ top: 5, right: 5, left: -10, bottom: -10 }}>
                        <defs>
                        <linearGradient id="colorTodayMini" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.5}/>
                            <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                        </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="hour"
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `INR ${(value / 1000).toFixed(1)}k`}
                        />
                        <Bar dataKey="today" fill="url(#colorTodayMini)" radius={[2, 2, 0, 0]} />
                        <Line type="monotone" dataKey="yesterday" stroke="hsl(var(--muted-foreground))" strokeWidth={1} dot={false} strokeDasharray="2 2" />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        ) : (
                <div className="flex flex-col justify-center items-center h-full w-full text-center text-muted-foreground">
                <PackageOpen className="h-10 w-10 mb-2" />
                <p>No sales as of yet</p>
            </div>
        )}
        </CardContent>
    </Card>
  );

  if (!hasData) {
    return cardComponent;
  }

  return (
     <Dialog>
      <DialogTrigger asChild>
        {cardComponent}
      </DialogTrigger>
      <DialogContent variant="full-screen" className="bg-background p-4 flex flex-col">
         <DialogTitle className="text-xl font-bold text-center text-cyan-400 mb-4 sr-only">Live Sales Overview</DialogTitle>
          <div className="flex-grow w-full h-full">
            <ChartContainer config={chartConfig} className="w-full h-full">
              <ComposedChart 
                  data={combinedData} 
                  margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
              >
                <XAxis
                  dataKey="hour"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `INR ${(value / 1000).toFixed(1)}k`}
                />
                <Tooltip
                  cursor={{ fill: 'hsla(var(--muted), 0.2)' }}
                  content={<ChartTooltipContent
                      formatter={(value, name) => (
                           <div>
                              <p className='font-semibold capitalize'>{name}</p>
                              <p>INR {Number(value).toLocaleString()}</p>
                          </div>
                      )}
                      indicator="dot"
                  />}
                />
                 <defs>
                   <linearGradient id="colorToday" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.1}/>
                   </linearGradient>
                </defs>
                <Bar dataKey="today" fill="url(#colorToday)" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="yesterday" stroke="hsl(var(--muted-foreground))" strokeWidth={2} dot={false} strokeDasharray="3 3" />
              </ComposedChart>
            </ChartContainer>
          </div>
      </DialogContent>
     </Dialog>
  );
}
