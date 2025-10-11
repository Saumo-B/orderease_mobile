
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
import { useForm, Controller } from 'react-hook-form';
import { Loader2, Check } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { axiosInstance } from '@/lib/axios-instance';
import { getBranchId } from '@/lib/utils';


interface AddIngredientDialogProps {
  children?: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onIngredientAdded: () => void;
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

export function AddIngredientDialog({
  children,
  isOpen,
  setIsOpen,
  onIngredientAdded,
}: AddIngredientDialogProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting, isValid },
  } = useForm<FormValues>({
    defaultValues: {
      name: '',
      quantity: undefined,
      unit: 'kg',
      lowStockThreshold: undefined,
    },
    mode: 'onChange'
  });

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
            ingredients: [{
                ...data,
                quantity: Number(data.quantity),
                lowStockThreshold: Number(data.lowStockThreshold)
            }]
        };
      await axiosInstance.post(
        `/api/ingredients?branch=${branchId}`,
        payload
      );
      onIngredientAdded();
      setIsOpen(false);
      reset();
    } catch (error) {
      console.error('Failed to add ingredients:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-cyan-400">Add Ingredient</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                  <Input
                      placeholder="Name"
                      {...register(`name`, { required: true })}
                      onChange={handleNameChange}
                      className="bg-background"
                  />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Input
                          type="number"
                          placeholder="Quantity"
                          {...register(`quantity`, { 
                              required: true,
                              valueAsNumber: true,
                              min: { value: 0.01, message: "" }
                          })}
                          className="bg-background"
                      />
                  </div>
                  <div className="space-y-2">
                      <Controller
                          control={control}
                          name={`unit`}
                          render={({ field }) => {
                              const [open, setOpen] = useState(false);
                              return (
                              <Popover open={open} onOpenChange={setOpen}>
                                  <PopoverTrigger asChild>
                                      <Button
                                      variant="outline"
                                      role="combobox"
                                      aria-expanded={open}
                                      className="w-full justify-between bg-background hover:bg-background"
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

            <DialogFooter className="mt-4">
              <Button
                  type="submit"
                  className="bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 min-w-[150px]"
                  disabled={!isValid || isSubmitting}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Ingredient'}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
