
'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Separator } from '../ui/separator';

interface OrderChartsProps {
  orderStatusData: { status: string; count: number }[];
  topItemsData: { name: string; count: number }[];
}

const STATUS_COLORS: { [key: string]: string } = {
  new: 'hsl(var(--chart-1))',
  paid: 'hsl(var(--chart-2))',
  served: 'hsl(var(--chart-3))',
  done: 'hsl(var(--chart-4))',
};

const itemColors = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function OrderCharts({
  orderStatusData,
  topItemsData,
}: OrderChartsProps) {
  const chartConfig = {
    count: { label: 'Count' },
    new: { label: 'New', color: STATUS_COLORS.new },
    paid: { label: 'Paid', color: STATUS_COLORS.paid },
    served: { label: 'Served', color: STATUS_COLORS.served },
    done: { label: 'Done', color: STATUS_COLORS.done },
  };

  return (
    <div className="space-y-8 h-full">
      <Card className="bg-card/70 border-white/10 shadow-lg">
        <CardHeader>
          <CardTitle className="text-cyan-400">Order Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square h-full"
            >
              <PieChart>
                <Tooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={orderStatusData}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={50}
                  strokeWidth={5}
                >
                  {orderStatusData.map((entry) => (
                    <Cell
                      key={entry.status}
                      fill={STATUS_COLORS[entry.status]}
                      stroke={STATUS_COLORS[entry.status]}
                    />
                  ))}
                </Pie>
                <Legend
                  content={({ payload }) => {
                    return (
                      <ul className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-4 text-sm text-muted-foreground">
                        {payload?.map((entry) => (
                          <li key={entry.value} className="flex items-center gap-2">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className="capitalize">{entry.value}</span>
                          </li>
                        ))}
                      </ul>
                    );
                  }}
                />
              </PieChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/70 border-white/10 shadow-lg">
        <CardHeader>
          <CardTitle className="text-cyan-400">Top Selling Items</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {topItemsData.map((item, index) => (
              <li key={item.name} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-3">
                   <div className="h-2 w-2 rounded-full" style={{ backgroundColor: itemColors[index % itemColors.length] }}></div>
                   <span>{item.name}</span>
                </div>
                <span className="font-bold">{item.count} sold</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
