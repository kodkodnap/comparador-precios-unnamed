import React, { useState, useEffect } from 'react';
import { AppProduct, BasketItem, StorePrice } from './types';
import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { BasketModal } from './components/BasketModal';
import { PriceReportModal } from './components/PriceReportModal';
import { PuertoMonttStoresView } from './components/PuertoMonttStoresView';
import { formatDateTime } from './utils/calculator';
import { matchProducts } from './utils/productMatcher';
import { 
  ShieldCheck, 
  Clock, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2, 
  Search, 
  Sparkles,
  Barcode,
  ShoppingBag
} from 'lucide-react';

const POPULAR_QUERIES = [
  'leche',
  'arroz',
  'aceite',
  'cafe',
  'fideos',
  'detergente',
  'huevos',
];

export default function App() {
  const [products, setProducts] = useState<AppProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentQuery, setCurrentQuery] = useState('leche');
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);

  // View state: 'catalog' | 'stores'
  const [currentView, setCurrentView] = useState<'catalog' | 'stores'>('catalog');

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<AppProduct | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isBasketOpen, setIsBasketOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportTargetProduct, setReportTargetProduct] = useState<AppProduct | null>(null);

  // Local storage for user reports (REPORTADO)
  const [localReports, setLocalReports] = useState<Record<string, StorePrice[]>>(() => {
    try {
      const saved = localStorage.getItem('ahorro_ptomontt_local_reports');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Basket state
  const [basket, setBasket] = useState<BasketItem[]>(() => {
    try {
      const saved = localStorage.getItem('ahorro_ptomontt_real_basket');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist basket
  useEffect(() => {
    localStorage.setItem('ahorro_ptomontt_real_basket', JSON.stringify(basket));
  }, [basket]);

  // Persist local reports
  useEffect(() => {
    localStorage.setItem('ahorro_ptomontt_local_reports', JSON.stringify(localReports));
  }, [localReports]);

  // Fetch real data from backend endpoint /api/search?q=...
  const fetchProductsFromBackend = async (queryTerm: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const term = queryTerm.trim() || 'leche';
      const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
      if (!res.ok) {
        throw new Error(`Error en servidor (status ${res.status})`);
      }
      const data = await res.json();
      const rawProducts = data.products || [];
      const fetchedTime = data.fetchedAt || new Date().toISOString();
      setLastFetchedAt(fetchedTime);

      // Map exactly 10 real products as requested in TAREA 2
      const mapped: AppProduct[] = rawProducts.slice(0, 10).map((raw: any) => {
        const item = raw.items?.[0] || {};
        const productId = String(raw.productId || item.skuId || Math.random());
        const slug = raw.slug || '';
        const verificationUrl = slug ? `https://www.jumbo.cl/p/${slug}` : undefined;

        // Base verified price from Jumbo API
        const verifiedPrice: StorePrice = {
          storeId: 'jumbo_costanera',
          chain: 'Jumbo',
          branchName: 'Jumbo Mall Paseo Costanera (jumbo.cl)',
          price: typeof item.price === 'number' ? item.price : null,
          listPrice: typeof item.listPrice === 'number' ? item.listPrice : null,
          ppumPrice: typeof item.ppumPrice === 'number' ? item.ppumPrice : null,
          ppumMeasurementUnit: item.ppumMeasurementUnit || null,
          origin: 'VERIFICADO',
          fetchedAt: fetchedTime,
          sourceDetail: 'Jumbo.cl API Oficial',
          verificationUrl,
          inStock: Boolean(item.stock),
        };

        // Attach any user reports saved locally on this device
        const extraReports = localReports[productId] || [];

        return {
          id: productId,
          name: item.name || raw.name || 'Producto sin nombre',
          brand: raw.brand || '',
          category: raw.categoryNames?.[0] || 'Supermercado',
          barcode: item.ean || undefined,
          image: item.images?.[0] || '',
          slug,
          prices: [verifiedPrice, ...extraReports],
          firstMeasuredAt: fetchedTime,
        };
      });

      setProducts(mapped);
      setCurrentQuery(term);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setErrorMessage(err.message || 'No se pudo conectar al backend de precios reales.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load: 10 real products
  useEffect(() => {
    fetchProductsFromBackend('leche');
  }, []);

  const handleSearchSubmit = (q: string) => {
    if (!q.trim()) return;
    fetchProductsFromBackend(q);
  };

  const handleBarcodeDetected = (code: string) => {
    setIsScannerOpen(false);
    // Find in currently loaded products or search backend
    const found = products.find(p => p.barcode === code.trim());
    if (found) {
      setSelectedProduct(found);
    } else {
      // Query backend for this barcode
      fetchProductsFromBackend(code);
    }
  };

  const handleAddToBasket = (product: AppProduct, quantity: number = 1) => {
    setBasket(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const handleUpdateBasketQuantity = (productId: string, delta: number) => {
    setBasket(prev =>
      prev
        .map(i => {
          if (i.product.id === productId) {
            const newQ = i.quantity + delta;
            return newQ > 0 ? { ...i, quantity: newQ } : null;
          }
          return i;
        })
        .filter(Boolean) as BasketItem[]
    );
  };

  const handleRemoveBasketItem = (productId: string) => {
    setBasket(prev => prev.filter(i => i.product.id !== productId));
  };

  const handleSaveReport = (productId: string, reportedPrice: number, authorName: string, storeName: string) => {
    const newReport: StorePrice = {
      storeId: 'local_' + Date.now(),
      chain: storeName,
      branchName: storeName,
      price: reportedPrice,
      origin: 'REPORTADO',
      fetchedAt: new Date().toISOString(),
      sourceDetail: 'Reporte local en este navegador',
      author: authorName,
    };

    setLocalReports(prev => {
      const existing = prev[productId] || [];
      return {
        ...prev,
        [productId]: [newReport, ...existing],
      };
    });

    setProducts(prev =>
      prev.map(p => {
        if (p.id === productId) {
          return {
            ...p,
            prices: [...p.prices, newReport],
          };
        }
        return p;
      })
    );
  };

  const totalBasketCount = basket.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        isLoading={isLoading}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenBasketModal={() => setIsBasketOpen(true)}
        basketCount={totalBasketCount}
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {currentView === 'stores' ? (
          <PuertoMonttStoresView />
        ) : (
          <div className="space-y-6">
            {/* Real Data Banner */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 leading-tight">
                      Catálogo con Precios Reales Verificables
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Mostrando 10 productos reales obtenidos en vivo desde la API de <strong>jumbo.cl</strong>.
                    </p>
                  </div>
                </div>

                {lastFetchedAt && (
                  <div className="text-left sm:text-right text-xs text-slate-600 font-mono bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block uppercase">Última medición en vivo:</span>
                    <span>{formatDateTime(lastFetchedAt)}</span>
                  </div>
                )}
              </div>

              {/* Quick Search Chips for Chilean Essentials */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                <span className="text-xs text-slate-400 font-medium shrink-0 mr-1">Búsquedas rápidas:</span>
                {POPULAR_QUERIES.map(q => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => {
                      setSearchQuery(q);
                      fetchProductsFromBackend(q);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors shrink-0 ${
                      currentQuery.toLowerCase() === q
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Banner if API fails */}
            {errorMessage && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Error al consultar el catálogo oficial de jumbo.cl:</p>
                  <p className="mt-0.5">{errorMessage}</p>
                  <button
                    type="button"
                    onClick={() => fetchProductsFromBackend(currentQuery)}
                    className="mt-2 px-3 py-1 bg-rose-600 text-white rounded font-bold hover:bg-rose-700 transition-colors"
                  >
                    Reintentar conexión
                  </button>
                </div>
              </div>
            )}

            {/* Loading Skeleton */}
            {isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 animate-pulse">
                    <div className="aspect-[4/3] bg-slate-100 rounded-lg" />
                    <div className="h-4 bg-slate-100 rounded w-2/3" />
                    <div className="h-5 bg-slate-100 rounded w-full" />
                    <div className="h-6 bg-slate-100 rounded w-1/2 pt-2" />
                  </div>
                ))}
              </div>
            )}

            {/* Real Products Grid (10 items) */}
            {!isLoading && products.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>
                    Mostrando <strong className="text-slate-900">{products.length} productos reales</strong> para "{currentQuery}"
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Haz clic en "Ver en jumbo.cl" en cualquier tarjeta para verificarlo en vivo
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {products.map(product => {
                    const inCart = basket.find(b => b.product.id === product.id);
                    return (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onSelect={p => setSelectedProduct(p)}
                        onAddToBasket={p => handleAddToBasket(p, 1)}
                        inBasketCount={inCart?.quantity || 0}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty state */}
            {!isLoading && products.length === 0 && !errorMessage && (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
                <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center mx-auto">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">No encontramos productos en jumbo.cl para "{currentQuery}"</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Intenta buscar con un término más general como "leche", "arroz" o "aceite".
                </p>
                <button
                  type="button"
                  onClick={() => fetchProductsFromBackend('leche')}
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Ver Leches Reales
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">AhorroPtoMontt</span>
            <span>·</span>
            <span>Datos reales obtenidos directamente vía API de Jumbo Chile</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Regla de transparencia: sin datos inventados ni simulaciones encubiertas
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToBasket={(prod, qty) => handleAddToBasket(prod, qty)}
        onOpenReportPrice={prod => {
          setReportTargetProduct(prod);
          setIsReportOpen(true);
        }}
      />

      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onBarcodeDetected={handleBarcodeDetected}
        products={products}
      />

      <BasketModal
        isOpen={isBasketOpen}
        onClose={() => setIsBasketOpen(false)}
        basket={basket}
        onUpdateQuantity={handleUpdateBasketQuantity}
        onRemoveItem={handleRemoveBasketItem}
        onClearBasket={() => setBasket([])}
      />

      <PriceReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        product={reportTargetProduct}
        onSaveReport={handleSaveReport}
      />
    </div>
  );
}
