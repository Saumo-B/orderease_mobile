
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


import PageTransition from '@/components/PageTransition';
import { GridSkeleton } from '@/components/GridSkeleton';

export default function MenuManagementPage() {
  const [menuItems, setMenuItems] = useState<FullMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isAddMenuItemDialogOpen, setIsAddMenuItemDialogOpen, menuItemsCache, setMenuItemsCache } = useOrder();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<FullMenuItem | null>(null);

  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');

  // Pagination state
  const [visibleCount, setVisibleCount] = useState(20);

  const fetchMenuItems = useCallback(async () => {
    const branchId = getBranchId();
    if (!branchId) {
      console.error("Branch ID not found");
      return;
    }

    // 1. Check Context Cache (Fastest - In Memory)
    if (menuItemsCache[branchId]) {
      setMenuItems(menuItemsCache[branchId]);
      updateCategories(menuItemsCache[branchId]);
      setLoading(false);
      return;
    }

    // 2. Check Local Storage (Fast - Persisted)
    const localCacheKey = `menu-cache-${branchId}`;
    const storedCache = localStorage.getItem(localCacheKey);
    let hasCachedData = false;

    if (storedCache) {
      try {
        const parsedCache = JSON.parse(storedCache);
        if (Array.isArray(parsedCache) && parsedCache.length > 0) {
          setMenuItems(parsedCache);
          updateCategories(parsedCache);
          setLoading(false); // Show content immediately!
          hasCachedData = true;
        }
      } catch (e) {
        console.warn("Failed to parse local menu cache", e);
      }
    }

    if (!hasCachedData) {
      setLoading(true);
    }

    // 3. Network Fetch (Background update if cached, blocking if not)
    try {
      const response = await axiosInstance.get(`/api/menu?branch=${branchId}`);

      if (response.data && Array.isArray(response.data)) {
        const formattedMenuItems: FullMenuItem[] = response.data.map(
          (item: any) => {
            let imageUrl = item.imageUrl || '';
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

        // Only update state if data changed or if we didn't have cached data
        // For simplicity, we just update. React works it out.
        setMenuItems(sortedMenuItems);
        updateCategories(sortedMenuItems);

        // Update caches
        setMenuItemsCache(prev => ({ ...prev, [branchId]: sortedMenuItems }));
        localStorage.setItem(localCacheKey, JSON.stringify(sortedMenuItems));

      } else {
        throw new Error('Invalid data format from API');
      }
    } catch (err: any) {
      console.error('Failed to fetch menu items:', err);
      if (!hasCachedData) {
        setError(err.message || 'Could not load the menu. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  }, [menuItemsCache, setMenuItemsCache]);

  const updateCategories = (items: FullMenuItem[]) => {
    if (items.length > 0) {
      const uniqueCategories = Array.from(new Set(items.map(item => item.category)));
      uniqueCategories.sort();
      setCategories(['All', ...uniqueCategories]);
    } else {
      setCategories(['All']);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  useEffect(() => {
    setVisibleCount(20);
  }, [activeCategory]);


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

  // Pagination Logic
  const visibleMenuItems = filteredMenuItems.slice(0, visibleCount);

  if (loading) {
    return <GridSkeleton />;
  }

  const addMenuItemCard = (
    <AddMenuItemDialog
      isOpen={isAddMenuItemDialogOpen}
      setIsOpen={setIsAddMenuItemDialogOpen}
      onMenuItemAdded={handleMenuItemAdded}
    >
      <Card
        className="h-full flex flex-col items-center justify-center cursor-pointer group bg-card/70 border-border border-2 border-dashed min-h-[250px]"
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
    <PageTransition className="space-y-8">
      {error ? (
        <div className="text-center py-16 bg-destructive/10 text-destructive rounded-lg flex flex-col items-center justify-center">
          <AlertTriangle className="h-12 w-12 mb-4" />
          <p className="text-lg">{error}</p>
        </div>
      ) : (
        <div>
          <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-6">
            <TabsList className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              {categories.map(category => (
                <TabsTrigger key={category} value={category}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {menuItems.length > 0 ? (
            <div className="space-y-8">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {/* Show Add Card only on the first page or if explicitly desired. Let's keep it as the first item always for easy access */}
                {addMenuItemCard}

                {visibleMenuItems.map((item) => (
                  <Card
                    key={item.id}
                    className={cn(
                      "group bg-card/70 border-border flex flex-col overflow-hidden duration-300",
                      "cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all"
                    )}
                    onClick={() => handleEditClick(item)}
                  >
                    <div className="aspect-video relative overflow-hidden">
                      <MenuItemImage
                        src={item.imageUrl}
                        alt={item.name}
                        outOfStock={item.outOfStock}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2">
                        <span className="text-white text-xs font-medium">Click to edit</span>
                      </div>
                    </div>
                    <CardHeader className="p-3 pb-1 flex-grow">
                      <CardTitle className="text-base text-foreground truncate transition-colors group-hover:text-primary">{item.name}</CardTitle>
                      <CardDescription className="text-xs text-muted-foreground mt-1 h-8 overflow-hidden line-clamp-2">{item.description}</CardDescription>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{item.category}</p>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 mt-auto flex justify-between items-center">
                      <p className="text-lg font-bold text-gradient">₹{item.price}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {visibleCount < filteredMenuItems.length && (
                <div className="flex justify-center pt-4">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full max-w-sm"
                    onClick={() => setVisibleCount(prev => prev + 20)}
                  >
                    Load More ({filteredMenuItems.length - visibleCount} remaining)
                  </Button>
                </div>
              )}
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

    </PageTransition>
  );
}
