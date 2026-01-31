
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, AlertTriangle, Users, Plus } from 'lucide-react';
import type { StaffMember } from '@/lib/types';
import { axiosInstance } from '@/lib/axios-instance';
import { getBranchId } from '@/lib/utils';
import { useOrder } from '@/context/OrderContext';
import { AddStaffDialog } from '@/components/roles/AddStaffDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';


const roleColors: Record<string, string> = {
  owner: 'bg-red-500/20 text-red-300',
  manager: 'bg-yellow-500/20 text-yellow-300',
  chef: 'bg-yellow-500/20 text-yellow-300',
  waiter: 'bg-green-500/20 text-green-300',
};


import PageTransition from '@/components/PageTransition';
import { GridSkeleton } from '@/components/GridSkeleton';

export default function RolesPage() {
  // Use global staff directly
  const { staff, isAddStaffDialogOpen, setIsAddStaffDialogOpen, fetchStaff } = useOrder();
  const [error, setError] = useState<string | null>(null);

  const handleRefresh = useCallback(() => {
    const branchId = getBranchId();
    if (branchId) fetchStaff(branchId);
  }, [fetchStaff]);

  const handleStaffAdded = handleRefresh;

  // Removed local loading state check as global loader handles it

  const addStaffCard = (
    <Card
      className="h-24 flex flex-col items-center justify-center cursor-pointer group bg-card/70 border-border border-2 border-dashed"
      onClick={() => setIsAddStaffDialogOpen(true)}
    >
      <CardContent className="flex flex-col items-center justify-center text-center p-6">
        <Plus className="h-8 w-8 text-foreground transition-colors" />
        <p className="mt-2 text-sm font-semibold text-foreground transition-colors">
          Add Staff
        </p>
      </CardContent>
    </Card>
  );

  return (
    <PageTransition className="space-y-8">
      {error ? (
        <div className="text-center py-16 bg-destructive/10 text-destructive rounded-lg flex flex-col items-center justify-center">
          <AlertTriangle className="h-12 w-12 mb-4" />
          <p className="text-lg">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {addStaffCard}
          {staff.map((member) => (
            <Card key={member.id} className="w-full group bg-card/70 border-border duration-300 h-24 flex flex-col justify-center">
              <CardContent className="p-4 flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <Avatar className="bg-primary/20 text-primary">
                    <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${member.name}&backgroundColor=transparent&textColor=00a63e`} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground transition-colors">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <Badge className={cn("capitalize", roleColors[member.role] || 'bg-gray-500')}>
                  {member.role}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddStaffDialog
        isOpen={isAddStaffDialogOpen}
        setIsOpen={setIsAddStaffDialogOpen}
        onStaffAdded={handleStaffAdded}
      />
    </PageTransition>
  );
}
