
'use client';

import type { Branch } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Phone, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BranchListProps {
  branches: Branch[];
  onEdit: (branch: Branch) => void;
}

export function BranchList({ branches, onEdit }: BranchListProps) {
  return (
    <Card className="bg-card/70 border-white/10 shadow-lg">
      <CardHeader>
        <CardTitle className="text-cyan-400">Your Branches</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {branches.map((branch) => (
            <div key={branch.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
              <div>
                <p className="font-semibold text-white">{branch.name}</p>
                 <p className="text-sm text-muted-foreground mt-1">{branch.address}</p>
                <div className="text-sm text-muted-foreground flex items-center gap-4 mt-1">
                    <p className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        PIN: {branch.pin}
                    </p>
                    <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {branch.phone}
                    </p>
                </div>
              </div>
               <Button
                variant="ghost"
                size="icon"
                className="text-cyan-300"
                onClick={() => onEdit(branch)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
