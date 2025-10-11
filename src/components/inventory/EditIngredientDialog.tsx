
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
import { useForm, Controller } from 'react-hook-form';
import { Loader2, Check } from 'lucide-react';
import type { Ingredient } from '@/lib/types';
import { useEffect, useState } from 'react';
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
import { cn, getBranchId } from '@/lib/utils';
import { useOrder } from '@/context/OrderContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { axiosInstance } from '@/lib/axios-instance';


interface EditIngredientDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onIngredientUpdated: () => void;
  onIngredientDeleted: () => void;
  ingredient: Ingredient;
}

type FormValues = {
    name: string;
    quantity: number;
    unit: string;
    lowStockThreshold: number;
};

const units = [
  { value: 'kg', label: 'kg' },
  { value: 'g', label: 'g' },
  { value: 'litre', label: 'litre' },
  { value: 'ml', label: 'ml' },
  { value: 'pcs', label: 'pcs' },
];

export function EditIngredientDialog({
  isOpen,
  setIsOpen,
  onIngredientUpdated,
  onIngredientDeleted,
  ingredient,
}: EditIngredientDialogProps) {
  const { deleteIngredient } = useOrder();

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting, isValid, isDirty },
  } = useForm<FormValues>({
    defaultValues: {
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        lowStockThreshold: ingredient.lowStockThreshold || 5,
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (ingredient) {
        reset({
            name: ingredient.name,
            quantity: ingredient.quantity,
            unit: ingredient.unit,
            lowStockThreshold: ingredient.lowStockThreshold || 5,
        });
    }
  }, [ingredient, reset]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const filteredValue = value.replace(/[^a-zA-Z\s]/g, '');
    setValue('name', filteredValue, { shouldValidate: true, shouldDirty: true });
  };


  const onSubmit = async (data: FormValues) => {
    try {
        const branchId = getBranchId();
        if (!branchId) {
            throw new Error("Branch ID not found. Please log in again.");
        }
        const payload = {
            name: data.name,
            quantity: Number(data.quantity),
            unit: data.unit,
            lowStockThreshold: Number(data.lowStockThreshold),
        };

      await axiosInstance.patch(
        `/api/ingredients/${ingredient.id}?branch=${branchId}`,
        payload
      );
      onIngredientUpdated();
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to update ingredient:', error);
    }
  };

  const handleDelete = async () => {
    const success = await deleteIngredient(ingredient.id);
    if (success) {
      onIngredientDeleted();
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-cyan-400">Update Ingredient</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                  <Input
                      id="name"
                      placeholder="Name"
                      {...register(`name`, { required: true })}
                      onChange={handleNameChange}
                      className="bg-background"
                  />
              </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Input
                          id="quantity"
                          type="number"
                          placeholder="Quantity"
                          {...register(`quantity`, { 
                              required: true,
                              valueAsNumber: true,
                              min: 0
                          })}
                          className="bg-background"
                      />
                  </div>
                   <div className="space-y-2">
                      <Controller
                          control={control}
                          name="unit"
                          render={({ field }) => {
                             const [open, setOpen] = useState(false);
                             return (
                              <Popover open={open} onOpenChange={setOpen}>
                                  <PopoverTrigger asChild>
                                      <Button
                                      variant="outline"
                                      role="combobox"
                                      aria-expanded={open}
                                      className="w-full justify-between bg-background"
                                      >
                                      {field.value
                                          ? units.find((unit) => unit.value === field.value)?.label
                                          : "Select unit..."}
                                      
                                      </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-[180px] p-0 bg-card border-border">
                                      <Command>
                                      <CommandList>
                                          <CommandGroup>
                                          {units.map((unit) => (
                                              <CommandItem
                                              key={unit.value}
                                              value={unit.value}
                                              onSelect={(currentValue) => {
                                                  field.onChange(currentValue === field.value ? "" : currentValue)
                                                  setOpen(false)
                                              }}
                                              >
                                              <Check
                                                  className={cn(
                                                  "mr-2 h-4 w-4",
                                                  field.value === unit.value ? "opacity-100" : "opacity-0"
                                                  )}
                                              />
                                              {unit.label}
                                              </CommandItem>
                                          ))}
                                          </CommandGroup>
                                      </CommandList>
                                      </Command>
                                  </PopoverContent>
                              </Popover>
                          )}}
                      />
                  </div>
              </div>
              <div className="space-y-2">
                   <Input
                      type="number"
                      placeholder="Low Stock Threshold"
                      {...register(`lowStockThreshold`, { 
                          required: true,
                          valueAsNumber: true,
                          min: { value: 0, message: "" }
                      })}
                      className="bg-background"
                  />
              </div>
            </div>

            <DialogFooter className="flex-col-reverse sm:flex-col-reverse gap-2 mt-4">
              <Button
                type="submit"
                className="w-full bg-cyan-500/20 text-cyan-300"
                disabled={isSubmitting || !isValid || !isDirty}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Update Ingredient'
                )}
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    className="w-full bg-destructive/20 text-destructive border-0"
                  >
                    Delete Ingredient
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the ingredient. This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel
                      className={cn(
                        buttonVariants({ variant: 'outline' }),
                        'bg-cyan-500/20 text-cyan-300 border-0'
                      )}
                    >
                      No, Go Back
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className={cn(
                        buttonVariants({ variant: 'destructive' }),
                        'bg-destructive/20 text-destructive border-0'
                      )}
                      onClick={handleDelete}
                    >
                      Yes, Delete Ingredient
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
