import React from 'react';
import { Search, Barcode, ShoppingBag, Store, ShieldCheck, RefreshCw } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: (query: string) => void;
  isLoading: boolean;
  onOpenScanner: () => void;
  onOpenBasketModal: () => void;
  basketCount: number;
  currentView: 'catalog' | 'stores';
  onViewChange: (view: 'catalog' | 'stores') => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  isLoading,
  onOpenScanner,
  onOpenBasketModal,
  basketCount,
  currentView,
  onViewChange,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearchSubmit(searchQuery);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      {/* Top Banner: Real Verified Data Indicator */}
      <div className="bg-slate-900 text-slate-200 px-4 py-1.5 text-[11px] font-medium">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-emerald-300">DATOS REALES:</span>
            <span>Precios conectados en tiempo real con la API de jumbo.cl · Cero datos inventados</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verificables individualmente</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Logo */}
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => {
                onViewChange('catalog');
                onSearchSubmit('leche');
              }}
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                PM
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-base font-black text-slate-900 tracking-tight leading-none">
                    AhorroPtoMontt
                  </h1>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                    EN VIVO
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                  Comparador con Precios Reales Verificados
                </p>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-1.5 md:hidden">
              <button
                type="button"
                onClick={() => onViewChange(currentView === 'catalog' ? 'stores' : 'catalog')}
                aria-label={currentView === 'stores' ? 'Ver productos' : 'Ver locales'}
                className="p-2 bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold"
                title={currentView === 'stores' ? 'Productos' : 'Locales'}
              >
                <Store className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onOpenScanner}
                aria-label="Escanear código de barras"
                className="p-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold border border-blue-200"
                title="Escanear código"
              >
                <Barcode className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onOpenBasketModal}
                aria-label="Abrir mi canasta"
                className="relative p-2 bg-blue-600 text-white rounded-lg text-xs font-semibold shadow-xs"
                title="Canasta"
              >
                <ShoppingBag className="w-4 h-4" />
                {basketCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-white">
                    {basketCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="flex-1 max-w-xl flex items-center gap-2">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                {isLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                ) : (
                  <Search className="w-3.5 h-3.5" />
                )}
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Buscar producto real en jumbo.cl (ej: leche, arroz, aceite, cafe)..."
                className="w-full pl-9 pr-16 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => onSearchSubmit(searchQuery)}
                className="absolute inset-y-1 right-1 px-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-semibold transition-colors"
              >
                Buscar
              </button>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenScanner}
              className="py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold border border-blue-200 flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Barcode className="w-4 h-4" />
              <span>Escanear Código EAN</span>
            </button>

            <button
              type="button"
              onClick={() => onViewChange(currentView === 'catalog' ? 'stores' : 'catalog')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                currentView === 'stores'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>{currentView === 'stores' ? 'Volver al Catálogo Real' : 'Locales PM (Referencia)'}</span>
            </button>

            <button
              type="button"
              onClick={onOpenBasketModal}
              className="py-2 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Mi Canasta</span>
              {basketCount > 0 && (
                <span className="bg-emerald-500 text-white text-[10px] font-black rounded-full px-1.5 py-0.2">
                  {basketCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
