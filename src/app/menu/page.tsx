
'use client';

import { Header } from '@/components/Header';
import { MenuItemCard } from '@/components/MenuItemCard';
import type { MenuItem } from '@/lib/types';
import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, Home } from 'lucide-react';
import { axiosInstance } from '@/lib/axios-instance';
import { useSearchParams, useRouter } from 'next/navigation';
import { getCustomerBranchId } from '@/lib/utils';
import Link from 'next/link';

function MenuComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const branchId = searchParams.get('branch');

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  
  useEffect(() => {
    // This effect handles redirection if no branch ID is present.
    if (!branchId) {
      const savedBranchId = getCustomerBranchId();
      if (savedBranchId) {
        router.replace(`/menu?branch=${savedBranchId}`);
      } else {
        // If no branchId in URL and nothing in storage, stop loading.
        setLoading(false); 
      }
      return; // Stop execution until redirection is complete or we confirm no branch is available.
    }
    
    // If we have a branchId, save it and fetch the menu.
    try {
        localStorage.setItem('customerBranchId', branchId);
    } catch (e) {
        console.error("Could not save branch ID to localStorage", e);
    }

    async function fetchMenu() {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/api/menu?branch=${branchId}`);
        
        if (response.data && Array.isArray(response.data)) {
          const formattedMenuItems: MenuItem[] = response.data.map((item: any) => {
             let imageUrl = item.imageUrl || '';
             // If it's not a full URL, assume it's a Pixabay ID and construct the URL
             if (imageUrl && !imageUrl.startsWith('http')) {
                imageUrl = `https://cdn.pixabay.com/photo/${imageUrl}.jpg`;
             }
             return {
                id: item._id,
                name: item.name,
                description: item.description,
                price: item.price,
                image: imageUrl,
                category: item.category,
            };
          });

          const uniqueCategories = Array.from(new Set(formattedMenuItems.map(item => item.category)));

          setMenuItems(formattedMenuItems);
          setCategories(uniqueCategories);
        } else {
            throw new Error("Invalid data format from API");
        }
      } catch (err) {
        console.error("Failed to fetch menu:", err);
        setError("Could not load the menu. Please try refreshing the page.");
      } finally {
        setLoading(false);
      }
    }

    fetchMenu();

  }, [branchId, router]);

  const scrollToCategory = (category: string) => {
    sectionRefs.current[category]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };
  
  if (!branchId && !loading) {
    return (
       <>
        <Header />
         <main className="container mx-auto py-8 px-4 flex justify-center items-center h-[calc(100vh-150px)]">
            <div className="text-center py-16 bg-card/70 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center max-w-lg w-full">
                <Home className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold mb-2">No Branch Selected</h2>
                <p className="text-muted-foreground mb-6">Please use a valid link to view a restaurant's menu.</p>
                <Button asChild>
                    <Link href="/kitchen/login">Login as Staff</Link>
                </Button>
            </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="container mx-auto py-8 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">Our Menu</h1>
          <p className="text-lg text-muted-foreground mt-2">Freshly prepared, just for you.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
          </div>
        ) : error ? (
           <div className="text-center py-16 bg-destructive/10 text-destructive rounded-lg flex flex-col items-center justify-center">
            <AlertTriangle className="h-12 w-12 mb-4" />
            <p className="text-lg">{error}</p>
          </div>
        ) : (
          <>
            <div className="sticky top-[65px] z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2 -mx-4 px-4 mb-8 border-b">
              <div className="flex justify-center gap-2 overflow-x-auto pb-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant="outline"
                    className="rounded-full shadow-sm"
                    onClick={() => scrollToCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-12">
              {categories.map((category) => (
                <section
                  key={category}
                  id={category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}
                  ref={(el) => (sectionRefs.current[category] = el)}
                  className="scroll-mt-[140px]"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <h2 className="text-3xl font-bold font-headline">{category}</h2>
                    <div className="flex-grow border-t-2 border-dashed border-primary/20"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {menuItems
                      .filter((item) => item.category === category)
                      .map((item: MenuItem) => (
                        <MenuItemCard key={item.id} item={item} />
                      ))}
                  </div>
                </section>
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={
        <div className="flex justify-center items-center min-h-screen">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
        </div>
    }>
      <MenuComponent />
    </Suspense>
  );
}
