
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm, Controller } from 'react-hook-form';
import { Loader2, Check } from 'lucide-react';
import { useState } from 'react';
import { cn, getBranchId } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { useOrder } from '@/context/OrderContext';
import type { AddStaffInput } from '@/lib/types';

interface AddStaffDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onStaffAdded: () => void;
}

const roles = [
  { value: 'manager', label: 'Manager' },
  { value: 'chef', label: 'Chef' },
  { value: 'waiter', label: 'Waiter' },
];

export function AddStaffDialog({ isOpen, setIsOpen, onStaffAdded }: AddStaffDialogProps) {
  const { addStaffMember } = useOrder();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, isValid },
  } = useForm<AddStaffInput>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'waiter',
    },
    mode: 'onChange',
  });

  const onSubmit = async (data: AddStaffInput) => {
    const success = await addStaffMember(data);
    if (success) {
      onStaffAdded();
      setIsOpen(false);
      reset();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-primary">Add Staff</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="py-4 space-y-4">
            <Input
              placeholder="Name"
              {...register('name', { required: true })}
              className="bg-background"
            />
            <Input
              type="email"
              placeholder="Email"
              {...register('email', { required: true, pattern: /^\S+@\S+$/i })}
              className="bg-background"
            />
            <Input
              type="password"
              placeholder="Password"
              {...register('password', { required: true, minLength: 6 })}
              className="bg-background"
            />
            <Controller
              control={control}
              name="role"
              render={({ field }) => {
                const [open, setOpen] = useState(false);
                return (
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between bg-background capitalize"
                      >
                        {field.value ? roles.find((role) => role.value === field.value)?.label : "Select role..."}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-card border-border">
                      <Command>
                        <CommandList>
                          <CommandGroup>
                            {roles.map((role) => (
                              <CommandItem
                                key={role.value}
                                value={role.value}
                                onSelect={(currentValue) => {
                                  field.onChange(currentValue);
                                  setOpen(false);
                                }}
                                className="capitalize"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === role.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {role.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                );
              }}
            />
          </div>
          <DialogFooter className="mt-6">
            <Button
              type="submit"
              className="bg-primary/20 text-primary min-w-[150px]"
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Staff'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
