import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Merge Tailwind classes with conflict resolution
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format price in cents to Icelandic Kronur (ISK)
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('is-IS', {
    style: 'currency',
    currency: 'ISK',
  }).format(price / 100) // Convert cents to ISK
}

