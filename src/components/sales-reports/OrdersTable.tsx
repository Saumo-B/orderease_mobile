
'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  ColumnFiltersState,
  getFilteredRowModel,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import type { SalesReportOrder } from '@/lib/types';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { ArrowUpDown } from 'lucide-react';

const statusColors: Record<string, string> = {
    new: 'bg-blue-500/20 text-blue-300',
    paid: 'bg-yellow-500/20 text-yellow-300',
    served: 'bg-purple-500/20 text-purple-300',
    done: 'bg-green-500/20 text-green-300'
}

const statusDisplayMap: Record<string, string> = {
    done: 'Completed',
    paid: 'In Progress',
    new: 'New',
    served: 'Served',
};


const columns: ColumnDef<SalesReportOrder>[] = [
    {
        accessorKey: 'token',
        header: ({ column }) => {
          return (
            <div className="flex items-center">
                <span>Order ID</span>
                <Button
                variant="ghost"
                size="sm"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="ml-2 px-1"
                >
                    <ArrowUpDown className="h-4 w-4" />
                </Button>
            </div>
          )
        },
        cell: ({ row }) => <div className="font-mono">#{row.original.token}</div>,
    },
    {
        accessorKey: 'date',
        header: ({ column }) => {
          return (
             <div className="flex items-center">
                <span>Date</span>
                <Button
                variant="ghost"
                size="sm"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="ml-2 px-1"
                >
                    <ArrowUpDown className="h-4 w-4" />
                </Button>
            </div>
          )
        },
        cell: ({ row }) => new Date(row.original.date).toLocaleString(),
    },
    {
        accessorKey: 'customerName',
        header: ({ column }) => {
          return (
            <div className="flex items-center">
                <span>Customer</span>
                <Button
                variant="ghost"
                size="sm"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="ml-2 px-1"
                >
                    <ArrowUpDown className="h-4 w-4" />
                </Button>
            </div>
          )
        },
    },
    {
        accessorKey: 'status',
        header: ({ column }) => {
          return (
            <div className="flex items-center">
                <span>Status</span>
                <Button
                variant="ghost"
                size="sm"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="ml-2 px-1"
                >
                    <ArrowUpDown className="h-4 w-4" />
                </Button>
            </div>
          )
        },
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <Badge className={cn("font-bold", statusColors[status] || 'bg-gray-500')}>
                {statusDisplayMap[status] || status}
            </Badge>
          )
        },
    },
    {
        accessorKey: 'total',
        header: ({ column }) => {
          return (
            <div className="flex items-center justify-end">
                <span>Amount</span>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="px-1"
                >
                    <ArrowUpDown className="h-4 w-4" />
                </Button>
            </div>
          )
        },
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue('total'))
          const formatted = `INR ${new Intl.NumberFormat('en-IN').format(amount)}`
     
          return <div className="text-right font-medium">{formatted}</div>
        },
    },
];

interface OrdersTableProps {
  data: SalesReportOrder[];
}

export function OrdersTable({ data }: OrdersTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'date', desc: true } // Default sort by date descending
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="w-full">
       <div className="flex items-center py-4">
        <Input
          placeholder="Filter by customer..."
          value={(table.getColumn("customerName")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("customerName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm bg-background"
        />
      </div>
      <div className="rounded-md border border-white/10">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-white/10">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="border-white/10"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
