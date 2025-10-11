
'use client';

import { useState, useEffect } from 'react';
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

export default function InventoryPage() {
  const [inventory, setInventory] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAddIngredientDialogOpen, setIsAddIngredientDialogOpen } = useOrder();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const branchId = getBranchId();
      if (!branchId) {
        throw new Error("Branch ID not found. Please log in again.");
      }
      const response = await axiosInstance.get(
        `/api/ingredients?branch=${branchId}`
      );
      if (response.data && Array.isArray(response.data)) {
        const formattedInventory: Ingredient[] = response.data.map(
          (item: any) => ({
            id: item._id,
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            lowStockWarning: item.lowStockWarning,
            lowStockThreshold: item.lowStockThreshold,
          })
        );
        // Sort the inventory alphabetically by name
        const sortedInventory = formattedInventory.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setInventory(sortedInventory);
      } else {
        throw new Error('Invalid data format from API');
      }
    } catch (err: any) {
      console.error('Failed to fetch inventory:', err);
      setError(err.message || 'Could not load the inventory. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleIngredientAdded = () => {
    fetchInventory();
  };

  const handleIngredientUpdated = () => {
    fetchInventory();
  };

  const handleIngredientDeleted = () => {
    fetchInventory();
  };
  
  const handleEditClick = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setIsEditDialogOpen(true);
  };

  const addIngredientButton = (
    <AddIngredientDialog
      isOpen={isAddIngredientDialogOpen}
      setIsOpen={setIsAddIngredientDialogOpen}
      onIngredientAdded={handleIngredientAdded}
    >
        <Button 
            className="w-full h-16 bg-card/70 border-white/10 shadow-lg border-2 border-dashed"
            onClick={() => setIsAddIngredientDialogOpen(true)}
        >
            <Plus className="h-8 w-8 text-white mr-2" />
            <span className="text-base font-semibold text-white">Add Ingredient</span>
        </Button>
    </AddIngredientDialog>
  );

  return (
    <div className="space-y-4">
       {loading ? (
        <div className="flex justify-center items-center min-h-[calc(100vh-300px)]">
            <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
        </div>
        ) : error ? (
        <div className="text-center py-16 bg-destructive/10 text-destructive rounded-lg flex flex-col items-center justify-center">
            <AlertTriangle className="h-12 w-12 mb-4" />
            <p className="text-lg">{error}</p>
        </div>
        ) : (
        <div className="space-y-4">
            {addIngredientButton}
            {inventory.length > 0 ? (
                <div className="flex flex-col gap-4">
                    {inventory.map((item) => (
                        <Card 
                            key={item.id} 
                            className="group bg-card/70 border-white/10 shadow-lg duration-300 cursor-pointer"
                            onClick={() => handleEditClick(item)}
                        >
                          <CardContent className="p-4 flex justify-between items-center">
                            <p className="font-semibold text-lg text-white transition-colors">{item.name}</p>
                            <p className={cn("text-sm font-mono", item.lowStockWarning ? "text-destructive" : "text-green-400")}>
                                {`${item.quantity} ${item.unit}`}
                            </p>
                          </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center text-muted-foreground py-16 flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-lg">
                    <PackageOpen className="h-12 w-12 mb-4" />
                    <p>Your inventory is empty.</p>
                    <p className="text-sm">Start by adding your first ingredient.</p>
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

    </div>
  );
}
