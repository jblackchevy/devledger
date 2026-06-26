import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number | string | null | undefined,
  opts?: Intl.NumberFormatOptions,
): string {
  if (amount === null || amount === undefined) return '—';
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    ...opts,
  }).format(n);
}

export function formatPercent(
  value: number | string | null | undefined,
  decimals = 1,
): string {
  if (value === null || value === undefined) return '—';
  const n = typeof value === 'string' ? parseFloat(value) : value;
  return `${(n * 100).toFixed(decimals)}%`;
}
