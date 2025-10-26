
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { Plus, Trash2, Loader2, ChevronsUpDown, Minus } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import type { Ingredient } from '@/lib/types';
import { Textarea } from '../ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ScrollArea } from '../ui/scroll-area';
import { axiosInstance } from '@/lib/axios-instance';
import { getBranchId } from '@/lib/utils';

interface AddMenuItemDialogProps {
  children?: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onMenuItemAdded: () => void;
}

type RecipeItem = {
  ingredient: string; // This will be the ingredient ID
  qtyRequired: number;
};

type FormValues = {
    name: string;
    price: string;
    category: string;
    description: string;
    imageUrl: string;
    recipe: RecipeItem[];
};

export function AddMenuItemDialog({
  children,
  isOpen,
  setIsOpen,
  onMenuItemAdded,
}: AddMenuItemDialogProps) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      name: '',
      price: '',
      category: '',
      description: '',
      imageUrl: '',
      recipe: [],
    },
  });

  const priceValue = watch('price');
  const watchedFields = watch();

  const isFormFilled = 
    !!watchedFields.name?.trim() &&
    !!watchedFields.category?.trim() &&
    !!watchedFields.price?.trim() &&
    !!watchedFields.description?.trim() &&
    !!watchedFields.imageUrl?.trim() &&
    watchedFields.recipe?.length > 0 &&
    watchedFields.recipe.every(r => r.qtyRequired && r.qtyRequired > 0);


  useEffect(() => {
    async function fetchIngredients() {
      if (isOpen) {
        try {
          const branchId = getBranchId();
          if (!branchId) {
            throw new Error("Branch ID not found.");
          }
          const response = await axiosInstance.get(`/api/ingredients?branch=${branchId}`);
          const formattedIngredients: Ingredient[] = response.data.map((item: any) => ({
            id: item._id,
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
          }));
          setIngredients(formattedIngredients);
        } catch (error) {
          console.error('Failed to fetch ingredients:', error);
        }
      }
    }
    fetchIngredients();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
        reset({
          name: '',
          price: '',
          category: '',
          description: '',
          imageUrl: '',
          recipe: [],
        });
    }
  }, [isOpen, reset]);
  
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setValue('price', value);
    }
  };

  const handleAlphaInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'name' || name === 'category') {
      const filteredValue = value.replace(/[^a-zA-Z\s]/g, '');
      setValue(name as 'name' | 'category', filteredValue, { shouldValidate: true });
    }
  };


  const onSubmit = async (data: FormValues) => {
     try {
       const branchId = getBranchId();
       if (!branchId) {
         throw new Error("Branch ID not found. Please log in again.");
       }
       const payload = {
        menuItems: [{
            ...data,
            price: Number(data.price),
            recipe: data.recipe.map(r => ({ ...r, qtyRequired: Number(r.qtyRequired) })),
        }]
       };

      await axiosInstance.post(`/api/menu?branch=${branchId}`, payload);
      onMenuItemAdded();
      setIsOpen(false);
      reset();
    } catch (error) {
      console.error('Failed to add menu items:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent 
        className="sm:max-w-4xl bg-card border-border flex flex-col h-full"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-primary">Add Item</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-grow no-scrollbar">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-4">
                      <Input placeholder="Name" {...register(`name`, { required: true })} onChange={handleAlphaInputChange} className="bg-background" />
                      <Input placeholder="Category" {...register(`category`, { required: true })} onChange={handleAlphaInputChange} className="bg-background" />
                      <Input placeholder="Price" value={priceValue} onChange={handlePriceChange} className="bg-background" />
                      <Textarea placeholder="Description" {...register(`description`)} className="bg-background h-[234px]" />
                      <Input placeholder="Image URL" {...register(`imageUrl`, { required: true })} className="bg-background" />
                  </div>
                  
                  
                  {/* Right Column */}
                  <div className="bg-background p-6 rounded-lg flex flex-col h-[458px]">
                    <RecipeArray control={control} ingredients={ingredients} />
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <Button
                      type="submit"
                      className="bg-primary/20 text-primary min-w-[100px]"
                      disabled={isSubmitting || !isFormFilled}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Add Item'
                    )}
                  </Button>
                </DialogFooter>
              </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// Sub-component for managing the recipe array
function RecipeArray({ control, ingredients }: { control: any; ingredients: Ingredient[] }) {
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: `recipe`,
  });
  
  const [isAdding, setIsAdding] = useState(false);
  
  const recipeIngredientIds = fields.map((field: any) => field.ingredient);
  const availableIngredients = ingredients.filter(ing => !recipeIngredientIds.includes(ing.id));

  const handleSelectIngredient = (ingredientId: string) => {
    append({ ingredient: ingredientId, qtyRequired: '' });
    setIsAdding(false);
  };
  
  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 0) return; // Prevent negative numbers
    const fieldToUpdate: any = fields[index];
    update(index, { ...fieldToUpdate, qtyRequired: newQuantity });
  };


  return (
    <div className="h-full flex flex-col">
      <h3 className="text-lg font-semibold text-primary mb-4 flex-shrink-0">Recipe</h3>
      <ScrollArea className="flex-grow pr-4 -mr-4 no-scrollbar">
        <div className="space-y-2">
            {fields.map((field: any, index) => {
             const ingredient = ingredients.find(ing => ing.id === field.ingredient);
             if (!ingredient) return null;
             return (
                <div key={field.id} className="flex items-center justify-between p-2 rounded-md bg-card">
                  <div className="flex items-center gap-2">
                    <span>{ingredient.name}</span>
                    <span className="text-xs text-muted-foreground">({ingredient.unit})</span>
                  </div>
                  <div className="flex items-center gap-2">
                      <Input
                          type="number"
                          step="0.01"
                          placeholder="Qty"
                          {...control.register(`recipe.${index}.qtyRequired`, { valueAsNumber: true, required: "Qty is required" })}
                          className="bg-background w-24 h-8 text-center"
                      />
                      <Button size="icon" className="h-6 w-6 bg-destructive/20 text-destructive" onClick={() => remove(index)}>
                          <Trash2 className="h-4 w-4" />
                      </Button>
                  </div>
                </div>
             )
            })}
            
            {isAdding && (
               <IngredientSelector
                    ingredients={availableIngredients}
                    onSelect={handleSelectIngredient}
                    onClose={() => setIsAdding(false)}
                />
            )}
        </div>
      </ScrollArea>
      <div className="mt-auto pt-4 flex-shrink-0">
          {!isAdding && (
            <Button
                type="button"
                size="sm"
                className="w-full bg-primary/20 text-primary"
                onClick={() => setIsAdding(true)}
            >
                <Plus className="mr-2 h-4 w-4" />
                Add Ingredient
            </Button>
          )}
      </div>
    </div>
  );
}

function IngredientSelector({ ingredients, onSelect, onClose }: { ingredients: Ingredient[], onSelect: (value: string) => void, onClose: () => void }) {
  const popoverRef = useRef<HTMLDivElement>(null);

  const handleSelect = (currentValue: string) => {
    onSelect(currentValue);
  };

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div ref={popoverRef}>
      <Command className="bg-card border-border rounded-lg">
        <CommandInput placeholder="Search ingredient..." autoFocus />
        <CommandList>
          <CommandEmpty>No ingredient found.</CommandEmpty>
          <CommandGroup>
            {ingredients.map((ing) => (
              <CommandItem
                key={ing.id}
                value={ing.id}
                onSelect={handleSelect}
              >
                {ing.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}
