
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Users, UserPlus, CreditCard, Wallet, HelpCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface CustomerAnalysisProps {
  customerData: {
    newVsReturning: { new: number, returning: number };
    highSpenders: number;
  };
  paymentData: { method: string, count: number }[];
}

const customerColors = ['#22d3ee', '#22c55e']; // cyan-400, green-500

const allPaymentMethods = [
    { method: 'unknown', color: '#22d3ee', icon: HelpCircle }, // cyan-400
    { method: 'counter', color: '#22c55e', icon: Wallet },     // green-500
];

export function CustomerAnalysis({ customerData, paymentData }: CustomerAnalysisProps) {
  const customerChartData = [
    { name: 'New', value: customerData.newVsReturning.new, fill: customerColors[0] },
    { name: 'Returning', value: customerData.newVsReturning.returning, fill: customerColors[1] },
  ];

  const paymentDataMap = new Map(paymentData.map(p => [p.method.toLowerCase(), p.count]));

  const completePaymentData = allPaymentMethods.map(pm => ({
    method: pm.method,
    count: paymentDataMap.get(pm.method) || 0,
    color: pm.color,
    icon: pm.icon,
  }));


  const paymentChartData = paymentData.map((p) => {
      const methodInfo = allPaymentMethods.find(pm => pm.method === p.method.toLowerCase());
      return {
          name: p.method,
          value: p.count,
          fill: methodInfo ? methodInfo.color : 'hsl(var(--chart-5))',
      }
  });
  
  const totalPayments = paymentData.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="space-y-6">
      <Card className="bg-card/70 border-white/10 shadow-lg duration-300 group">
        <CardHeader>
          <CardTitle className="text-white group-hover:text-cyan-400 transition-colors">Customer Insights</CardTitle>
          <CardDescription>A look at your customer base.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center justify-center p-4 bg-background rounded-lg">
                <div className="h-[100px] w-[100px]">
                    <ChartContainer config={{}} className="w-full h-full">
                         <ResponsiveContainer>
                            <PieChart>
                                <Tooltip
                                    cursor={false}
                                    content={<ChartTooltipContent hideLabel />}
                                />
                                <Pie data={customerChartData} dataKey="value" nameKey="name" innerRadius={30} outerRadius={45} strokeWidth={2}>
                                    {customerChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} stroke={entry.fill} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>
                <div className="text-center mt-2">
                    <p className="text-2xl font-bold">{customerData.newVsReturning.new + customerData.newVsReturning.returning}</p>
                    <p className="text-sm text-muted-foreground">Total Customers</p>
                </div>
            </div>
             <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-md">
                        <UserPlus className="h-5 w-5"/>
                    </div>
                    <div>
                        <p className="font-bold text-lg">{customerData.newVsReturning.new}</p>
                        <p className="text-sm text-muted-foreground">New Customers</p>
                    </div>
                </div>
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/20 text-green-400 rounded-md">
                        <Users className="h-5 w-5"/>
                    </div>
                    <div>
                        <p className="font-bold text-lg">{customerData.newVsReturning.returning}</p>
                        <p className="text-sm text-muted-foreground">Returning</p>
                    </div>
                </div>
             </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card/70 border-white/10 shadow-lg duration-300 group">
        <CardHeader>
          <CardTitle className="text-white group-hover:text-cyan-400 transition-colors">Payment Methods</CardTitle>
          <CardDescription>How your customers are paying.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center justify-center p-4 bg-background rounded-lg">
               <div className="h-[100px] w-[100px]">
                  <ChartContainer config={{}} className="w-full h-full">
                     <ResponsiveContainer>
                        <PieChart>
                           <Tooltip
                              cursor={false}
                              content={<ChartTooltipContent hideLabel />}
                           />
                           <Pie data={paymentChartData} dataKey="value" nameKey="name" innerRadius={30} outerRadius={45} strokeWidth={2}>
                              {paymentChartData.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={entry.fill} stroke={entry.fill} />
                              ))}
                           </Pie>
                        </PieChart>
                     </ResponsiveContainer>
                  </ChartContainer>
               </div>
                <div className="text-center mt-2">
                    <p className="text-2xl font-bold">{totalPayments}</p>
                    <p className="text-sm text-muted-foreground">Total Payments</p>
                </div>
            </div>
            <div className="space-y-4">
               {completePaymentData.map((method) => {
                  const Icon = method.icon;
                  let colorClass = '';
                    if (method.color.startsWith('#')) {
                        // Special handling for hex colors to generate background/text classes
                        if (method.color === '#22d3ee') { // cyan
                            colorClass = 'text-cyan-300 bg-cyan-500/20';
                        } else if (method.color === '#22c55e') { // green
                            colorClass = 'text-green-300 bg-green-500/20';
                        }
                    } else {
                        // Handling for HSL colors from theme
                        if (method.method === 'online') {
                            colorClass = 'text-purple-300 bg-purple-500/20';
                        } else if (method.method === 'cod') {
                            colorClass = 'text-orange-300 bg-orange-500/20';
                        } else {
                             colorClass = 'text-gray-300 bg-gray-500/20';
                        }
                  }

                  return (
                    <div key={method.method} className="flex items-center gap-3">
                        <div className={`p-2 rounded-md ${colorClass}`}>
                            <Icon className="h-5 w-5"/>
                        </div>
                        <div>
                            <p className="font-bold text-lg">{method.count}</p>
                            <p className="text-sm text-muted-foreground capitalize">{method.method}</p>
                        </div>
                    </div>
                  )
                })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
