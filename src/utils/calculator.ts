import { AppProduct, StorePrice, BasketItem } from '../types';

export function formatCLP(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'Sin datos';
  }
  return '$' + Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function formatDateTime(isoString?: string): string {
  if (!isoString) return 'Sin fecha';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }) + ' hrs';
  } catch {
    return isoString;
  }
}

export function findBestPrice(product: AppProduct): { best: StorePrice | null; minPrice: number | null } {
  if (!product.prices || product.prices.length === 0) {
    return { best: null, minPrice: null };
  }
  const valid = product.prices.filter(p => p.price !== null && p.price > 0);
  if (valid.length === 0) {
    return { best: null, minPrice: null };
  }
  const sorted = [...valid].sort((a, b) => (a.price || 0) - (b.price || 0));
  return { best: sorted[0], minPrice: sorted[0].price };
}

export function findWorstPrice(product: AppProduct): { worst: StorePrice | null; maxPrice: number | null } {
  if (!product.prices || product.prices.length === 0) {
    return { worst: null, maxPrice: null };
  }
  const valid = product.prices.filter(p => p.price !== null && p.price > 0);
  if (valid.length === 0) {
    return { worst: null, maxPrice: null };
  }
  const sorted = [...valid].sort((a, b) => (b.price || 0) - (a.price || 0));
  return { worst: sorted[0], maxPrice: sorted[0].price };
}
