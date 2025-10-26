
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Loader2, AlertTriangle, PackageOpen, Plus, Ban } from 'lucide-react';
import type { FullMenuItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { EditMenuItemDialog } from '@/components/menu-management/EditMenuItemDialog';
import { AddMenuItemDialog } from '@/components/menu-management/AddMenuItemDialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useOrder } from '@/context/OrderContext';
import { axiosInstance } from '@/lib/axios-instance';
import { getBranchId } from '@/lib/utils';
import { cn } from '@/lib/utils';

// Helper function to check for a valid URL
const isValidUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  try {
    new URL(url);
    return url.startsWith('http://') || url.startsWith('https://');
  } catch (e) {
    return false;
  }
};


// A component to handle image errors gracefully
function MenuItemImage({ src, alt, outOfStock }: { src: string; alt: string, outOfStock?: boolean }) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(!isValidUrl(src));

  useEffect(() => {
    const valid = isValidUrl(src);
    setHasError(!valid);
    if (valid) {
      setImgSrc(src);
    }
  }, [src]);

  const handleNextImageError = () => {
    if (!hasError) {
      setHasError(true);
    }
  };
  
  if (hasError) {
    return (
      <div className="w-full h-full bg-muted flex items-center justify-center">
        <span className="text-xs text-muted-foreground text-center p-2">
          Invalid Image
        </span>
      </div>
    );
  }

  return (
    <div className={cn("relative w-full h-full", outOfStock && "grayscale")}>
        <Image
          src={imgSrc}
          alt={alt}
          fill
          className="object-cover"
          onError={handleNextImageError}
        />
        {outOfStock && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                <Ban className="h-8 w-8 text-foreground" />
                <span className="font-bold text-foreground mt-2 text-sm">OUT OF STOCK</span>
            </div>
        )}
    </div>
  );
}


export default function MenuManagementPage() {
  const [menuItems, setMenuItems] = useState<FullMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { isAddMenuItemDialogOpen, setIsAddMenuItemDialogOpen } = useOrder();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<FullMenuItem | null>(null);
  
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');

  const fetchMenuItems = useCallback(async () => {
    try {
      setLoading(true);
      const branchId = getBranchId();
      if (!branchId) {
        throw new Error("Branch ID not found. Please log in again.");
      }
      const response = await axiosInstance.get(
        `/api/menu?branch=${branchId}`
      );
      if (response.data && Array.isArray(response.data)) {
        const formattedMenuItems: FullMenuItem[] = response.data.map(
          (item: any) => {
             let imageUrl = item.imageUrl || '';
             // If it's not a full URL, assume it's a Pixabay ID and construct the URL
             if (imageUrl && !imageUrl.startsWith('http')) {
                imageUrl = `https://cdn.pixabay.com/photo/${imageUrl}.jpg`;
             }
             return {
                id: item._id,
                name: item.name,
                price: item.price,
                category: item.category,
                description: item.description,
                imageUrl: imageUrl,
                recipe: item.recipe,
                outOfStock: item.outOfStock || item.manualOutOfStock,
                manualOutOfStock: item.manualOutOfStock,
            };
          }
        );
        
        const sortedMenuItems = formattedMenuItems.sort((a, b) => a.name.localeCompare(b.name));
        
        setMenuItems(sortedMenuItems);
        if (sortedMenuItems.length > 0) {
          const uniqueCategories = Array.from(new Set(sortedMenuItems.map(item => item.category)));
          uniqueCategories.sort();
          setCategories(['All', ...uniqueCategories]);
        } else {
          setCategories(['All']);
        }
      } else {
        throw new Error('Invalid data format from API');
      }
    } catch (err: any) {
      console.error('Failed to fetch menu items:', err);
      setError(err.message || 'Could not load the menu. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  const handleMenuItemUpdated = () => {
    fetchMenuItems();
  };
  
  const handleMenuItemDeleted = () => {
    fetchMenuItems();
  };

  const handleMenuItemAdded = () => {
    fetchMenuItems();
  }

  const handleEditClick = (item: FullMenuItem) => {
    setSelectedMenuItem(item);
    setIsEditDialogOpen(true);
  };
  
  const filteredMenuItems = activeCategory === 'All'
    ? menuItems
    : menuItems.filter(item => item.category === activeCategory);

  const addMenuItemCard = (
    <AddMenuItemDialog
      isOpen={isAddMenuItemDialogOpen}
      setIsOpen={setIsAddMenuItemDialogOpen}
      onMenuItemAdded={handleMenuItemAdded}
    >
      <Card
        className="h-full flex flex-col items-center justify-center cursor-pointer group bg-card/70 border-border border-2 border-dashed"
        onClick={() => setIsAddMenuItemDialogOpen(true)}
      >
        <CardContent className="flex flex-row items-center justify-center p-4">
          <Plus className="h-6 w-6 text-foreground transition-colors" />
          <p className="ml-2 text-sm font-semibold text-foreground transition-colors">
            Add Item
          </p>
        </CardContent>
      </Card>
    </AddMenuItemDialog>
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
        <div>
          <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-6">
            <TabsList>
              {categories.map(category => (
                <TabsTrigger key={category} value={category}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {menuItems.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
                {addMenuItemCard}
                {filteredMenuItems.map((item) => (
                     <Card 
                          key={item.id} 
                          className={cn(
                            "group bg-card/70 border-border flex flex-col overflow-hidden duration-300",
                            "cursor-pointer"
                          )}
                          onClick={() => handleEditClick(item)}
                      >
                        <div className="aspect-video relative">
                            <MenuItemImage
                                src={item.imageUrl}
                                alt={item.name}
                                outOfStock={item.outOfStock}
                            />
                        </div>
                        <CardHeader className="p-3 pb-1 flex-grow">
                            <CardTitle className="text-base text-foreground truncate transition-colors">{item.name}</CardTitle>
                            <CardDescription className="text-xs text-muted-foreground mt-1 h-4 overflow-hidden line-clamp-1">{item.description}</CardDescription>
                            <p className="text-xs text-muted-foreground">{item.category}</p>
                        </CardHeader>
                        <CardContent className="p-3 pt-0 mt-auto">
                            <p className="text-lg font-bold text-green-400">INR {item.price}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {addMenuItemCard}
            </div>
          )}
        </div>
      )}

      {selectedMenuItem && (
        <EditMenuItemDialog
            isOpen={isEditDialogOpen}
            setIsOpen={setIsEditDialogOpen}
            onMenuItemUpdated={handleMenuItemUpdated}
            onMenuItemDeleted={handleMenuItemDeleted}
            menuItem={selectedMenuItem}
        />
      )}
      
      <AddMenuItemDialog
        isOpen={isAddMenuItemDialogOpen}
        setIsOpen={setIsAddMenuItemDialogOpen}
        onMenuItemAdded={handleMenuItemAdded}
      />

    </div>
  );
}
