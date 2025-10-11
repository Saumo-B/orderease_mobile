
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
import type { Branch, UpdateBranchInput } from '@/lib/types';
import { useEffect } from 'react';

interface EditBranchDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onBranchUpdated: () => void;
  branch: Branch;
}

export function EditBranchDialog({ isOpen, setIsOpen, onBranchUpdated, branch }: EditBranchDialogProps) {
  const { updateBranch } = useOrder();
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, isValid, isDirty },
    setValue,
  } = useForm<UpdateBranchInput>({
    defaultValues: {
      name: branch.name,
      PIN: branch.pin,
      phone: branch.phone,
      address: branch.address,
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (branch) {
        reset({
            name: branch.name,
            PIN: branch.pin,
            phone: branch.phone,
            address: branch.address,
        });
    }
  }, [branch, reset]);


  const onSubmit = async (data: UpdateBranchInput) => {
    const success = await updateBranch(branch.id, data);
    if (success) {
      onBranchUpdated();
      setIsOpen(false);
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
          <DialogTitle className="text-cyan-400">Update Branch</DialogTitle>
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
              className="bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 min-w-[150px]"
              disabled={!isValid || isSubmitting || !isDirty}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update Branch'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
