
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
      <DialogContent
        className="max-w-[380px] w-[90vw] p-0 bg-background/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden gap-0 top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] h-auto rounded-2xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
            <span className="font-bold text-lg text-foreground tracking-tight">Add New Staff</span>
          </div>

          <div className="p-5 space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1">Name</label>
              <Input
                placeholder="Staff Name"
                {...register('name', { required: true })}
                className="bg-white/5 border-white/10 h-10 focus-visible:ring-primary/50 font-medium"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1">Email</label>
              <Input
                type="email"
                placeholder="email@example.com"
                {...register('email', { required: true, pattern: /^\S+@\S+$/i })}
                className="bg-white/5 border-white/10 h-10 focus-visible:ring-primary/50"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                {...register('password', { required: true, minLength: 6 })}
                className="bg-white/5 border-white/10 h-10 focus-visible:ring-primary/50"
              />
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1">Role</label>
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
                          className="w-full justify-between bg-white/5 border-white/10 h-10 px-3 text-sm font-normal text-foreground capitalize focus:ring-1 focus:ring-primary/50"
                        >
                          {field.value ? roles.find((role) => role.value === field.value)?.label : "Select role"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0 bg-zinc-950 border-white/10">
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
          </div>

          {/* Footer */}
          <div className="p-4 pt-0">
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Account'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
