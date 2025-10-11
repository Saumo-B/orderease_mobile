import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getBranchId(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
      const profile = JSON.parse(storedProfile);
      return profile?.branchid || null;
    }
    return null;
  } catch (error) {
    console.error("Failed to parse user profile from localStorage", error);
    return null;
  }
}


export function getCustomerBranchId(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return localStorage.getItem('customerBranchId');
  } catch (error) {
    console.error("Failed to read customer branch ID from localStorage", error);
    return null;
  }
}
