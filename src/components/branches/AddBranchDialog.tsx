
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
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { useOrder } from '@/context/OrderContext';
import type { AddBranchInput } from '@/lib/types';

interface AddBranchDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onBranchAdded: () => void;
}

export function AddBranchDialog({ isOpen, setIsOpen, onBranchAdded }: AddBranchDialogProps) {
  const { addBranch } = useOrder();
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, isValid },
    setValue,
  } = useForm<AddBranchInput>({
    defaultValues: {
      name: '',
      PIN: '',
      phone: '',
      address: '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (data: AddBranchInput) => {
    const success = await addBranch(data);
    if (success) {
      onBranchAdded();
      setIsOpen(false);
      reset();
    }
  };

  const handleNumericInputChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'PIN' | 'phone') => {
    const value = e.target.value;
    const maxLength = fieldName === 'PIN' ? 6 : 10;
    if (/^\d*$/.test(value) && value.length <= maxLength) {
      setValue(fieldName, value, { shouldValidate: true, shouldDirty: true });
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^[a-zA-Z\s]*$/.test(value)) {
      setValue('name', value, { shouldValidate: true, shouldDirty: true });
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
            <span className="font-bold text-lg text-foreground tracking-tight">Add New Branch</span>
          </div>

          <div className="p-5 space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1">Branch Name</label>
              <Input
                placeholder="e.g. Downtown Hub"
                {...register('name', { required: true })}
                onChange={handleNameChange}
                className="bg-white/5 border-white/10 h-10 focus-visible:ring-primary/50 font-medium"
              />
            </div>

            {/* PIN Code */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1">Secure PIN</label>
              <Input
                placeholder="6-digit PIN"
                type="password"
                maxLength={6}
                {...register('PIN', {
                  required: true,
                  minLength: { value: 6, message: 'PIN must be 6 digits' },
                  maxLength: { value: 6, message: 'PIN must be 6 digits' },
                })}
                onChange={(e) => handleNumericInputChange(e, 'PIN')}
                className="bg-white/5 border-white/10 h-10 focus-visible:ring-primary/50 tracking-widest font-mono"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1">Contact Number</label>
              <Input
                placeholder="10-digit Phone"
                maxLength={10}
                {...register('phone', {
                  required: true,
                  minLength: { value: 10, message: 'Phone must be 10 digits' },
                  maxLength: { value: 10, message: 'Phone must be 10 digits' },
                })}
                onChange={(e) => handleNumericInputChange(e, 'phone')}
                className="bg-white/5 border-white/10 h-10 focus-visible:ring-primary/50 font-mono"
              />
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1">Address</label>
              <Input
                placeholder="Full Address"
                {...register('address', { required: true })}
                className="bg-white/5 border-white/10 h-10 focus-visible:ring-primary/50"
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
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Branch'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
