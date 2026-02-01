
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
import { Loader2, Check, Trash2 } from 'lucide-react';
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
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

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
      if (!branchId) throw new Error("Branch ID not found.");

      await axiosInstance.patch(
        `/api/ingredients/${ingredient.id}?branch=${branchId}`,
        {
          name: data.name,
          quantity: Number(data.quantity),
          unit: data.unit,
          lowStockThreshold: Number(data.lowStockThreshold),
        }
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
      <DialogContent
        className="max-w-[380px] w-[90vw] p-0 bg-background/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden gap-0 top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] h-auto rounded-2xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Header */}
          <div className="flex items-center p-4 border-b border-white/10 bg-white/5">
            <span className="font-bold text-lg text-foreground tracking-tight">Edit Ingredient</span>

            {/* Delete Button (Icon) */}
            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-12 top-4 h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors rounded-md"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-zinc-950 border-white/10">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Ingredient?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-0 bg-white/5 hover:bg-white/10">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1">Name</label>
              <Input
                id="name"
                placeholder="Ingredient Name"
                {...register(`name`, { required: true })}
                onChange={handleNameChange}
                className="bg-white/5 border-white/10 h-10 focus-visible:ring-primary/50 font-medium"
              />
            </div>

            {/* Quantity & Unit Row */}
            <div className="grid grid-cols-5 gap-3">
              <div className="col-span-3 space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1">Quantity</label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="0.00"
                  {...register(`quantity`, { required: true, valueAsNumber: true, min: 0 })}
                  className="bg-white/5 border-white/10 h-10 focus-visible:ring-primary/50"
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1">Unit</label>
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
                            className="w-full justify-between bg-white/5 border-white/10 h-10 px-3 text-sm font-normal text-muted-foreground focus:ring-1 focus:ring-primary/50"
                          >
                            <span className="truncate">
                              {field.value ? units.find((unit) => unit.value === field.value)?.label : "Unit"}
                            </span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[120px] p-0 bg-zinc-900 border-white/10">
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
                                    className="text-xs py-2"
                                  >
                                    {unit.label}
                                    <Check className={cn("ml-auto h-3 w-3", field.value === unit.value ? "opacity-100" : "opacity-0")} />
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    )
                  }}
                />
              </div>
            </div>

            {/* Threshold */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Low Stock Alert</label>
                <span className="text-[10px] text-muted-foreground/60">Notify when below</span>
              </div>
              <Input
                type="number"
                placeholder="Threshold"
                {...register(`lowStockThreshold`, { required: true, valueAsNumber: true, min: 0 })}
                className="bg-white/5 border-white/10 h-10 focus-visible:ring-primary/50"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 pt-0">
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
              disabled={isSubmitting || !isValid || !isDirty}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
