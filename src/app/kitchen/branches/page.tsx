
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertTriangle, Building, Plus, MapPin, Phone, Home } from 'lucide-react';
import type { Branch } from '@/lib/types';
import { axiosInstance } from '@/lib/axios-instance';
import { useOrder } from '@/context/OrderContext';
import { AddBranchDialog } from '@/components/branches/AddBranchDialog';
import { EditBranchDialog } from '@/components/branches/EditBranchDialog';

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
  
  const addBranchCard = (
     <Card
        className="h-20 flex flex-col items-center justify-center cursor-pointer group bg-card/70 border-border border-2 border-dashed"
        onClick={() => setIsAddBranchDialogOpen(true)}
      >
        <CardContent className="flex flex-col items-center justify-center text-center p-6">
          <Plus className="h-8 w-8 text-foreground transition-colors" />
          <p className="mt-2 text-sm font-semibold text-foreground transition-colors">
            Add Branch
          </p>
        </CardContent>
      </Card>
  );

  return (
    <div className="space-y-8">
      {loading ? (
        <div className="flex justify-center items-center min-h-[calc(100vh-300px)]">
          <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-destructive/10 text-destructive rounded-lg flex flex-col items-center justify-center">
          <AlertTriangle className="h-12 w-12 mb-4" />
          <p className="text-lg">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {addBranchCard}
            {branches.map((branch) => (
                <Card 
                    key={branch.id} 
                    className="w-full group bg-card/70 border-border duration-300 cursor-pointer h-20 flex flex-col justify-center"
                    onClick={() => handleEditClick(branch)}
                >
                  <CardContent className="p-4 text-sm flex justify-between items-center">
                    <div className="flex-grow">
                        <p className="font-bold text-lg text-foreground transition-colors truncate">
                            {branch.name}
                        </p>
                    </div>
                    <div className="flex items-center text-muted-foreground ml-4 gap-4">
                       <p className="flex items-center gap-2 truncate">
                          <Home className="h-4 w-4" />
                          {branch.address}
                      </p>
                      <p className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {branch.pin}
                      </p>
                      <p className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {branch.phone}
                      </p>
                    </div>
                  </CardContent>
                </Card>
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
    </div>
  );
}
