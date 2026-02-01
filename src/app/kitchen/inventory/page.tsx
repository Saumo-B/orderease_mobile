
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, AlertTriangle, Plus, Search, Filter, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import type { Ingredient } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { EditIngredientDialog } from '@/components/inventory/EditIngredientDialog';
import { AddIngredientDialog } from '@/components/inventory/AddIngredientDialog';
import { useOrder } from '@/context/OrderContext';
import { cn, getBranchId } from '@/lib/utils';
import PageTransition from '@/components/PageTransition';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function InventoryPage() {
  const { ingredients, fetchIngredients, isAddIngredientDialogOpen, setIsAddIngredientDialogOpen } = useOrder();

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'low-stock'>('all');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);

  const handleRefresh = useCallback(() => {
    const branchId = getBranchId();
    if (branchId) fetchIngredients(branchId);
  }, [fetchIngredients]);

  const handleIngredientAdded = handleRefresh;
  const handleIngredientUpdated = handleRefresh;
  const handleIngredientDeleted = handleRefresh;

  const handleEditClick = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setIsEditDialogOpen(true);
  };

  const filteredInventory = useMemo(() => {
    return ingredients.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filter === 'all' || (filter === 'low-stock' && item.lowStockWarning);
      return matchesSearch && matchesFilter;
    });
  }, [ingredients, searchQuery, filter]);

  const stats = useMemo(() => {
    return {
      total: ingredients.length,
      lowStock: ingredients.filter(i => i.lowStockWarning).length,
    };
  }, [ingredients]);

  const addIngredientCard = (
    <AddIngredientDialog
      isOpen={isAddIngredientDialogOpen}
      setIsOpen={setIsAddIngredientDialogOpen}
      onIngredientAdded={handleIngredientAdded}
    >
      <div
        className="h-[180px] flex flex-col items-center justify-center cursor-pointer group rounded-3xl border-2 border-dashed border-white/10 bg-white/5 hover:bg-primary/5 hover:border-primary/50 transition-all duration-300"
        onClick={() => setIsAddIngredientDialogOpen(true)}
      >
        <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 mb-3">
          <Plus className="h-7 w-7 text-primary" />
        </div>
        <p className="font-semibold text-foreground/80 group-hover:text-primary transition-colors">Add Ingredient</p>
      </div>
    </AddIngredientDialog>
  );

  return (
    <PageTransition className="space-y-6">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-card/40 backdrop-blur-md p-4 rounded-3xl border border-white/5 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search ingredients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background/50 border-white/10 rounded-xl focus:ring-primary/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex p-1 bg-background/50 rounded-xl border border-white/10 w-full md:w-auto">
            <button
              onClick={() => setFilter('all')}
              className={cn(
                "flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all",
                filter === 'all' ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"
              )}
            >
              All Items
            </button>
            <button
              onClick={() => setFilter('low-stock')}
              className={cn(
                "flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 justify-center",
                filter === 'low-stock' ? "bg-destructive text-destructive-foreground shadow-md" : "text-destructive hover:bg-destructive/10"
              )}
            >
              Low Stock
              {stats.lowStock > 0 && (
                <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] font-bold">{stats.lowStock}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {addIngredientCard}

        {filteredInventory.map((item) => {
          let status: 'no-stock' | 'low-stock' | 'healthy' = 'healthy';
          if (item.quantity <= 0) status = 'no-stock';
          else if (item.lowStockWarning) status = 'low-stock';

          const statusColors = {
            'no-stock': {
              text: 'text-destructive',
              bg: 'bg-destructive/20',
              border: 'border-destructive/40 bg-destructive/5',
              glow: 'bg-destructive/20',
              bar: 'bg-destructive'
            },
            'low-stock': {
              text: 'text-amber-500',
              bg: 'bg-amber-500/20',
              border: 'border-amber-500/40 bg-amber-500/5',
              glow: 'bg-amber-500/20',
              bar: 'bg-amber-500'
            },
            'healthy': {
              text: 'text-primary',
              bg: 'bg-primary/20',
              border: 'border-white/5 bg-card/40 hover:border-primary/30',
              glow: 'bg-primary/20',
              bar: 'bg-primary'
            }
          };

          const currentStyle = statusColors[status];

          const safeThreshold = item.lowStockThreshold || 1;
          const maxCapacity = safeThreshold * 3;
          const percentage = Math.min(Math.max((item.quantity / maxCapacity) * 100, 2), 100);

          return (
            <div
              key={item.id}
              onClick={() => handleEditClick(item)}
              className={cn(
                "group relative h-[180px] p-5 rounded-3xl border cursor-pointer transition-all duration-300 overflow-hidden flex flex-col justify-between hover:scale-[1.02]",
                currentStyle.border
              )}
            >
              {/* Background Glow */}
              <div className={cn(
                "absolute -right-8 -top-8 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none",
                currentStyle.glow
              )} />

              <div className="flex justify-between items-start relative z-10">
                <div>
                  <h3 className="font-bold text-lg text-foreground line-clamp-1">{item.name}</h3>
                  <p className="text-xs text-muted-foreground">Threshold: {item.lowStockThreshold} {item.unit}</p>
                </div>
                {status === 'no-stock' && (
                  <div className={cn("h-8 w-8 rounded-full flex items-center justify-center animate-pulse", currentStyle.bg, currentStyle.text)}>
                    <XCircle className="h-5 w-5" />
                  </div>
                )}
                {status === 'low-stock' && (
                  <div className={cn("h-8 w-8 rounded-full flex items-center justify-center animate-pulse", currentStyle.bg, currentStyle.text)}>
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                )}
                {status === 'healthy' && (
                  <div className={cn("h-8 w-8 rounded-full flex items-center justify-center opacity-50 group-hover:opacity-100 transition-opacity", currentStyle.bg, currentStyle.text)}>
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                )}
              </div>

              <div className="relative z-10">
                <div className="flex items-end gap-1 mb-2">
                  <span className={cn(
                    "text-4xl font-black tracking-tight transition-colors",
                    status === 'healthy' ? "text-foreground group-hover:text-primary" : currentStyle.text
                  )}>
                    {item.quantity}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground pb-1.5">{item.unit}</span>
                </div>

                {/* Visual Bar */}
                <div className="h-1.5 w-full bg-background/50 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", currentStyle.bar)}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className={cn("mt-1 flex items-center gap-1 text-[10px] font-semibold h-4", currentStyle.text)}>
                  {status === 'no-stock' && (
                    <>
                      <XCircle className="h-3 w-3" /> NO STOCK
                    </>
                  )}
                  {status === 'low-stock' && (
                    <>
                      <AlertTriangle className="h-3 w-3" /> LOW STOCK
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {filteredInventory.length === 0 && searchQuery && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            No ingredients found matching "{searchQuery}"
          </div>
        )}
      </div>

      {
        selectedIngredient && (
          <EditIngredientDialog
            isOpen={isEditDialogOpen}
            setIsOpen={setIsEditDialogOpen}
            onIngredientUpdated={handleIngredientUpdated}
            onIngredientDeleted={handleIngredientDeleted}
            ingredient={selectedIngredient}
          />
        )
      }
    </PageTransition >
  );
}
