
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
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-cyan-400">Add Branch</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="py-4 space-y-4">
            <Input
              placeholder="Branch Name"
              {...register('name', { required: true })}
              onChange={handleNameChange}
              className="bg-background"
            />
            <Input
              placeholder="PIN Code"
              {...register('PIN', { 
                  required: true,
                  minLength: { value: 6, message: 'PIN must be 6 digits' },
                  maxLength: { value: 6, message: 'PIN must be 6 digits' },
                })}
              onChange={(e) => handleNumericInputChange(e, 'PIN')}
              className="bg-background"
            />
            <Input
              placeholder="Branch Phone"
              {...register('phone', { 
                  required: true,
                  minLength: { value: 10, message: 'Phone must be 10 digits' },
                  maxLength: { value: 10, message: 'Phone must be 10 digits' },
              })}
              onChange={(e) => handleNumericInputChange(e, 'phone')}
              className="bg-background"
            />
            <Input
              placeholder="Address"
              {...register('address', { required: true })}
              className="bg-background"
            />
          </div>
          <DialogFooter className="mt-6">
            <Button
              type="submit"
              className="bg-cyan-500/20 text-cyan-300 min-w-[150px]"
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Branch'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
