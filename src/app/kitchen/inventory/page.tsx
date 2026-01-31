
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertTriangle, PackageOpen, Plus } from 'lucide-react';
import type { Ingredient } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { EditIngredientDialog } from '@/components/inventory/EditIngredientDialog';
import { AddIngredientDialog } from '@/components/inventory/AddIngredientDialog';
import { useOrder } from '@/context/OrderContext';
import { axiosInstance } from '@/lib/axios-instance';
import { getBranchId } from '@/lib/utils';
import { cn } from '@/lib/utils';

import PageTransition from '@/components/PageTransition';
import { GridSkeleton } from '@/components/GridSkeleton';

export default function InventoryPage() {
  const { ingredients, fetchIngredients, isAddIngredientDialogOpen, setIsAddIngredientDialogOpen } = useOrder();

  // Use global ingredients directly (already sorted by context)
  const inventory = ingredients;

  const [error, setError] = useState<string | null>(null);
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



  const addIngredientCard = (
    <AddIngredientDialog
      isOpen={isAddIngredientDialogOpen}
      setIsOpen={setIsAddIngredientDialogOpen}
      onIngredientAdded={handleIngredientAdded}
    >
      <Card
        className="h-full flex flex-col items-center justify-center cursor-pointer group bg-card/70 border-border border-2 border-dashed"
        onClick={() => setIsAddIngredientDialogOpen(true)}
      >
        <CardContent className="flex flex-row items-center justify-center text-center p-4">
          <Plus className="h-6 w-6 text-foreground transition-colors" />
          <p className="ml-2 text-sm font-semibold text-foreground transition-colors">Add Ingredient</p>
        </CardContent>
      </Card>
    </AddIngredientDialog>
  );

  return (
    <PageTransition className="space-y-4">
      {error ? (
        <div className="text-center py-16 bg-destructive/10 text-destructive rounded-lg flex flex-col items-center justify-center">
          <AlertTriangle className="h-12 w-12 mb-4" />
          <p className="text-lg">{error}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {inventory.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {addIngredientCard}
              {inventory.map((item) => (
                <Card
                  key={item.id}
                  className="group bg-card/70 border-border duration-300 cursor-pointer"
                  onClick={() => handleEditClick(item)}
                >
                  <CardContent className="p-4 flex flex-col items-start">
                    <p className="font-semibold text-lg text-foreground transition-colors">{item.name}</p>
                    <p className={cn("text-sm font-mono", item.lowStockWarning ? "text-destructive" : "text-green-400")}>
                      {`${item.quantity} ${item.unit}`}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {addIngredientCard}
            </div>
          )}
        </div>
      )}

      {selectedIngredient && (
        <EditIngredientDialog
          isOpen={isEditDialogOpen}
          setIsOpen={setIsEditDialogOpen}
          onIngredientUpdated={handleIngredientUpdated}
          onIngredientDeleted={handleIngredientDeleted}
          ingredient={selectedIngredient}
        />
      )}

    </PageTransition>
  );
}
