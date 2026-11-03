export type PriceOrigin = 'VERIFICADO' | 'REPORTADO' | 'SIMULADO';

export interface StorePrice {
  storeId: string;
  chain: string;
  branchName: string;
  price: number | null; // null if "sin datos"
  listPrice?: number | null;
  ppumPrice?: number | null;
  ppumMeasurementUnit?: string | null;
  origin: PriceOrigin;
  fetchedAt: string; // ISO string or human formatted
  sourceDetail: string; // e.g. "Jumbo.cl API Oficial", "Reporte local en este dispositivo", "Simulación Demo"
  author?: string; // for REPORTADO
  verificationUrl?: string; // direct link to verify on jumbo.cl
  inStock?: boolean;
}

export interface AppProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  barcode?: string; // EAN if available
  unit?: string;
  image: string;
  slug?: string;
  prices: StorePrice[];
  firstMeasuredAt: string; // "primera medición: <fecha y hora>"
}

export interface BasketItem {
  product: AppProduct;
  quantity: number;
}
