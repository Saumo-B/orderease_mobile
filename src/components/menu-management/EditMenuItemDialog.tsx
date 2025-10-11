
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import type { Ingredient, FullMenuItem, PopulatedRecipeItem } from '@/lib/types';
import { Textarea } from '../ui/textarea';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useOrder } from '@/context/OrderContext';
import { ScrollArea } from '../ui/scroll-area';
import { cn, getBranchId } from '@/lib/utils';
import { axiosInstance } from '@/lib/axios-instance';

interface EditMenuItemDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onMenuItemUpdated: () => void;
  onMenuItemDeleted: () => void;
  menuItem: FullMenuItem;
}

type FormValues = {
  name: string;
  price: number;
  category: string;
  description: string;
  imageUrl: string;
  recipe: {
    ingredient: string; // Ingredient ID
    qtyRequired: number;
  }[];
};

export function EditMenuItemDialog({
  isOpen,
  setIsOpen,
  onMenuItemUpdated,
  onMenuItemDeleted,
  menuItem,
}: EditMenuItemDialogProps) {
  const { updateMenuItem, deleteMenuItem } = useOrder();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);


  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isSubmitting, isDirty },
  } = useForm<FormValues>({
    defaultValues: {
      name: '',
      price: 0,
      category: '',
      description: '',
      imageUrl: '',
      recipe: [],
    },
  });

  const watchedFields = watch();

  const isFormValid =
    !!watchedFields.name?.trim() &&
    !!watchedFields.category?.trim() &&
    watchedFields.price > 0 &&
    !!watchedFields.description?.trim() &&
    !!watchedFields.imageUrl?.trim() &&
    watchedFields.recipe?.length > 0 &&
    watchedFields.recipe.every(r => r.qtyRequired && r.qtyRequired > 0);

  useEffect(() => {
    async function fetchDetails() {
      if (isOpen && menuItem) {
        setDialogLoading(true);
        setDialogError(null);
        try {
          const branchId = getBranchId();
          if (!branchId) {
            throw new Error("Branch ID not found.");
          }
          // Fetch all available ingredients for the dropdown
          const ingredientsResponse = await axiosInstance.get(`/api/ingredients?branch=${branchId}`);
          const formattedIngredients: Ingredient[] = ingredientsResponse.data.map((item: any) => ({
            id: item._id,
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
          }));
          setIngredients(formattedIngredients);

          // Fetch the detailed menu item with populated recipe
          const menuItemResponse = await axiosInstance.get(`/api/menu/${menuItem.id}`);
          const detailedMenuItem: { recipe: PopulatedRecipeItem[] } & FullMenuItem = menuItemResponse.data;

          // Reset the form with the fetched data
          reset({
            name: detailedMenuItem.name,
            price: detailedMenuItem.price,
            category: detailedMenuItem.category,
            description: detailedMenuItem.description,
            imageUrl: detailedMenuItem.imageUrl.endsWith('.jpg') ? detailedMenuItem.imageUrl.slice(0, -4) : detailedMenuItem.imageUrl,
            recipe: detailedMenuItem.recipe.map(r => ({
              ingredient: r.ingredient._id,
              qtyRequired: r.qtyRequired
            })),
          });

        } catch (error) {
          console.error('Failed to fetch details:', error);
          setDialogError('Could not load item details. Please try again.');
        } finally {
            setDialogLoading(false);
        }
      }
    }
    fetchDetails();
  }, [isOpen, menuItem, reset]);

  const handleAlphaInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'name' || name === 'category') {
      const filteredValue = value.replace(/[^a-zA-Z\s]/g, '');
      setValue(name as 'name' | 'category', filteredValue, { shouldValidate: true, shouldDirty: true });
    }
  };

  const onSubmit = async (data: FormValues) => {
    const payload = {
      ...data,
      price: Number(data.price),
      recipe: data.recipe.map(r => ({ ...r, qtyRequired: Number(r.qtyRequired) }))
    };

    const success = await updateMenuItem(menuItem.id, payload);
    if (success) {
      onMenuItemUpdated();
      setIsOpen(false);
    }
  };

  const handleDelete = async () => {
    const success = await deleteMenuItem(menuItem.id);
    if (success) {
      onMenuItemDeleted();
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-4xl bg-card border-border flex flex-col h-full">
        <DialogHeader>
          <DialogTitle className="text-cyan-400">Update Item</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-grow no-scrollbar">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {dialogLoading ? (
                  <div className="md:col-span-2 flex justify-center items-center min-h-[490px]">
                    <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
                  </div>
                ) : dialogError ? (
                  <div className="md:col-span-2 flex flex-col justify-center items-center text-destructive min-h-[490px]">
                    <AlertTriangle className="h-8 w-8 mb-2" />
                    <p>{dialogError}</p>
                  </div>
                ) : (
                  <>
                    {/* Left Column */}
                    <div className="space-y-4">
                        <Input placeholder="Name" {...register('name', { required: true })} onChange={handleAlphaInputChange} className="bg-background" />
                        <Input placeholder="Category" {...register('category', { required: true })} onChange={handleAlphaInputChange} className="bg-background" />
                        <Input type="number" step="0.01" placeholder="Price" {...register('price', { required: true, valueAsNumber: true })} className="bg-background" />
                        <Textarea placeholder="Description" {...register('description')} className="bg-background h-[234px]" />
                        <Input placeholder="Image URL" {...register('imageUrl', { required: true })} className="bg-background" />
                    </div>

                    {/* Right Column */}
                    <div className="bg-background p-6 rounded-lg flex flex-col h-[458px]">
                        <RecipeArray control={control} ingredients={ingredients} />
                    </div>
                  </>
                )}
              </div>
              <DialogFooter className="mt-6 flex flex-col gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                      <Button type="button" variant="destructive" className="w-full bg-destructive/20 text-destructive border-0">
                          Delete Item
                      </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                      <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                          This will permanently delete the menu item. This action cannot be undone.
                      </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className={cn(buttonVariants({ variant: 'outline' }), "bg-cyan-500/20 text-cyan-300 border-0")}>No, Go Back</AlertDialogCancel>
                        <AlertDialogAction
                          className={cn(buttonVariants({ variant: 'destructive' }), "bg-destructive/20 text-destructive border-0")}
                          onClick={handleDelete}
                        >
                          Yes, Delete Item
                        </AlertDialogAction>
                      </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button
                    type="submit"
                    className="w-full bg-cyan-500/20 text-cyan-300"
                    disabled={isSubmitting || dialogLoading || !!dialogError || !isDirty || !isFormValid}
                >
                    {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                    'Update Item'
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

function RecipeArray({ control, ingredients }: { control: any; ingredients: Ingredient[] }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'recipe',
  });
  const [isAdding, setIsAdding] = useState(false);

  const recipeIngredientIds = fields.map((field: any) => field.ingredient);
  const availableIngredients = ingredients.filter(ing => !recipeIngredientIds.includes(ing.id));

  const handleSelectIngredient = (ingredientId: string) => {
    append({ ingredient: ingredientId, qtyRequired: '' });
    setIsAdding(false);
  };

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex-shrink-0">Recipe</h3>
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
                      <Button
                        size="icon"
                        className="h-6 w-6 bg-destructive/20 text-destructive"
                        onClick={() => remove(index)}
                      >
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
                className="w-full bg-cyan-500/20 text-cyan-300"
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

    

    