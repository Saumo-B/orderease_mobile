'use client';

import { useOrder } from '@/context/OrderContext';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import type { Branch } from '@/lib/types';

export function BranchSwitcher() {
    const { currentBranch, allBranches, handleBranchSelect } = useOrder();
    const [open, setOpen] = useState(false);
    const [isAllAccess, setIsAllAccess] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const staticProfile = JSON.parse(localStorage.getItem('staticUserProfile') || '{}');
            setIsAllAccess(staticProfile.branchName === 'All');
        }
    }, []);

    const onBranchSelect = (branch: Branch) => {
        handleBranchSelect(branch);
        setOpen(false);
    };

    if (!currentBranch) return null;

    // Single branch view (read-only)
    if (!isAllAccess || allBranches.length <= 1) {
        return (
            <Button
                variant="outline"
                className="w-[200px] justify-between text-base font-medium px-4 bg-background/50 backdrop-blur-sm border-white/10 cursor-default hover:bg-background/50"
            >
                <div className="flex items-center gap-2 truncate">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span className="truncate">{currentBranch.name}</span>
                </div>
            </Button>
        );
    }

    // Multi-branch switcher
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] justify-between text-base font-medium px-4 bg-background/50 backdrop-blur-sm border-white/10 hover:bg-white/5 hover:border-primary/30 transition-all duration-300"
                >
                    <div className="flex items-center gap-2 truncate">
                        <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(0,166,62,0.5)]" />
                        <span className="truncate">{currentBranch.name}</span>
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0 bg-card border-white/10 shadow-xl backdrop-blur-xl">
                <Command>
                    <CommandInput placeholder="Search branch..." className="h-9" />
                    <CommandList>
                        <CommandEmpty>No branch found.</CommandEmpty>
                        <CommandGroup>
                            {allBranches.map((branch) => (
                                <CommandItem
                                    key={branch.id}
                                    value={branch.name}
                                    onSelect={() => onBranchSelect(branch)}
                                    className="cursor-pointer aria-selected:bg-primary/10 aria-selected:text-primary"
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            currentBranch.id === branch.id ? "opacity-100 text-primary" : "opacity-0"
                                        )}
                                    />
                                    {branch.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
