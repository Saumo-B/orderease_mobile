
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertTriangle, Building, Plus, MapPin, Phone, Home } from 'lucide-react';
import type { Branch } from '@/lib/types';
import { axiosInstance } from '@/lib/axios-instance';
import { useOrder } from '@/context/OrderContext';
import { AddBranchDialog } from '@/components/branches/AddBranchDialog';
import { EditBranchDialog } from '@/components/branches/EditBranchDialog';

import PageTransition from '@/components/PageTransition';
import { GridSkeleton } from '@/components/GridSkeleton';

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAddBranchDialogOpen, setIsAddBranchDialogOpen } = useOrder();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  const fetchBranches = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get(`/api/branch`);
      if (response.data && Array.isArray(response.data)) {
        const formattedBranches: Branch[] = response.data.map((item: any) => ({
          id: item._id,
          name: item.name,
          pin: item.PIN,
          phone: item.phone,
          address: item.address,
        }));
        const sortedBranches = formattedBranches.sort((a, b) => a.name.localeCompare(b.name));
        setBranches(sortedBranches);
      } else {
        throw new Error('Invalid data format from API');
      }
    } catch (err: any) {
      console.error('Failed to fetch branches:', err);
      setError(err.message || 'Could not load branches. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const handleBranchAdded = () => {
    fetchBranches();
  };

  const handleBranchUpdated = () => {
    fetchBranches();
  };

  const handleEditClick = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return <GridSkeleton />;
  }

  const addBranchCard = (
    <div
      onClick={() => setIsAddBranchDialogOpen(true)}
      className="group relative h-full min-h-[180px] rounded-3xl border-2 border-dashed border-white/10 bg-white/5 hover:bg-primary/5 hover:border-primary/50 transition-all duration-500 cursor-pointer flex flex-col items-center justify-center gap-3 overflow-hidden"
    >
      <div className="h-16 w-16 rounded-full bg-black/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500">
        <Plus className="h-8 w-8 text-foreground/50 group-hover:text-primary transition-colors" />
      </div>
      <p className="font-semibold text-foreground/60 group-hover:text-primary transition-colors">
        Add New Outlet
      </p>
    </div>
  );

  return (
    <PageTransition className="space-y-8">
      {error ? (
        <div className="text-center py-16 bg-destructive/10 text-destructive rounded-lg flex flex-col items-center justify-center">
          <AlertTriangle className="h-12 w-12 mb-4" />
          <p className="text-lg">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {addBranchCard}

          {branches.map((branch) => (
            <div
              key={branch.id}
              onClick={() => handleEditClick(branch)}
              className="group relative p-6 rounded-3xl bg-card/40 backdrop-blur-md border border-white/5 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 cursor-pointer flex flex-col gap-4 overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10 group-hover:scale-105 transition-transform duration-300">
                  <Building className="h-6 w-6 text-primary" />
                </div>
                <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-muted-foreground group-hover:border-primary/30 group-hover:text-primary transition-colors">
                  PIN: {branch.pin}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors mb-1">
                  {branch.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {branch.address}
                </p>
              </div>

              <div className="mt-auto pt-4 border-t border-white/5 flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary/60" />
                  <span>{branch.phone}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddBranchDialog
        isOpen={isAddBranchDialogOpen}
        setIsOpen={setIsAddBranchDialogOpen}
        onBranchAdded={handleBranchAdded}
      />

      {selectedBranch && (
        <EditBranchDialog
          isOpen={isEditDialogOpen}
          setIsOpen={setIsEditDialogOpen}
          onBranchUpdated={handleBranchUpdated}
          branch={selectedBranch}
        />
      )}
    </PageTransition>
  );
}
