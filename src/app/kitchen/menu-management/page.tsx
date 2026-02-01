
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Loader2, AlertTriangle, PackageOpen, Plus, Ban, Search } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredMenuItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
        className="h-full w-full flex flex-col cursor-pointer group bg-card/70 border-border border-2 border-dashed min-h-0 overflow-hidden"
        onClick={() => setIsAddMenuItemDialogOpen(true)}
      >
        {/* Fake Image Section to match Item Card Aspect Ratio */}
        <div className="aspect-[4/3] w-full flex items-center justify-center bg-white/5 border-b border-dashed border-border group-hover:bg-primary/5 transition-colors shrink-0">
          <Plus className="h-10 w-10 text-foreground/50 group-hover:text-primary transition-colors group-hover:scale-110 duration-300" />
        </div>

        {/* Fake Content Section */}
        <CardContent className="flex flex-col items-center justify-center p-3 flex-grow">
          <p className="text-sm font-semibold text-foreground/70 group-hover:text-primary transition-colors text-center">
            Add New Item
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
          {/* Header Bar: Search & Categories */}
          <div className="flex flex-col xl:flex-row gap-4 justify-between items-center bg-card/40 backdrop-blur-md p-2 rounded-3xl border border-white/5 shadow-sm mb-8">
            {/* Search Bar */}
            <div className="relative w-full xl:w-96 shrink-0 z-10">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search menu items..."
                className="w-full h-12 pl-11 pr-4 rounded-2xl bg-background/50 border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all outline-none text-sm placeholder:text-muted-foreground/50 border"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Categories */}
            <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full xl:w-auto min-w-0">
              <TabsList className="h-12 bg-transparent p-0 w-full justify-start xl:justify-end overflow-x-auto no-scrollbar flex items-center gap-2">
                {categories.map(category => (
                  <TabsTrigger
                    key={category}
                    value={category}
                    className={cn(
                      "rounded-xl px-4 h-10 text-sm font-medium transition-all duration-300 shrink-0 border border-transparent",
                      activeCategory === category
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5 hover:border-white/10"
                    )}
                  >
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 p-1">
            {/* Show Add Card */}
            {addMenuItemCard}

            {visibleMenuItems.map((item) => (
              <Card
                key={item.id}
                className={cn(
                  "group relative overflow-hidden transition-all duration-500 flex flex-col h-full",
                  "bg-gradient-to-br from-white/10 to-white/5 border-white/10",
                  "hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1 hover:border-primary/50 cursor-pointer"
                )}
                onClick={() => handleEditClick(item)}
              >
                {/* Image Section */}
                <div className="aspect-[4/3] relative overflow-hidden bg-black/50 shrink-0">
                  <MenuItemImage
                    src={item.imageUrl}
                    alt={item.name}
                    outOfStock={item.outOfStock}
                  />
                  {/* Edit Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                    <span className="text-white font-bold tracking-widest text-xs border border-white/30 px-4 py-2 rounded-full uppercase scale-90 group-hover:scale-100 transition-transform">
                      Edit Item
                    </span>
                  </div>
                  {/* Price Tag (Float) */}
                  <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded text-xs font-bold border border-white/10 shadow-lg">
                    ₹{item.price}
                  </div>
                </div>

                {/* Content Section */}
                <CardHeader className="p-3 space-y-1 flex-grow">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-base font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                      {item.name}
                    </CardTitle>
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold text-primary/80">
                    {item.category}
                  </p>
                  <CardDescription className="text-xs text-muted-foreground/80 line-clamp-2">
                    {item.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          {visibleCount < filteredMenuItems.length && (
            <div className="flex justify-center pt-8 pb-8">
              <Button
                variant="outline"
                size="lg"
                className="bg-white/5 border-white/10 hover:bg-white/10 text-white min-w-[200px]"
                onClick={() => setVisibleCount(prev => prev + 20)}
              >
                Load More Items
              </Button>
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
