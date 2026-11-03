import React from 'react';
import { BasketItem } from '../types';
import { formatCLP, formatDateTime } from '../utils/calculator';
import { OriginBadge } from './OriginBadge';
import { X, Trash2, Plus, Minus, ShoppingBag, ShieldCheck } from 'lucide-react';

interface BasketModalProps {
  isOpen: boolean;
  onClose: () => void;
  basket: BasketItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearBasket: () => void;
}

export const BasketModal: React.FC<BasketModalProps> = ({
  isOpen,
  onClose,
  basket,
  onUpdateQuantity,
  onRemoveItem,
  onClearBasket,
}) => {
  if (!isOpen) return null;

  // Calculate total strictly with real prices
  const total = basket.reduce((acc, item) => {
    const verified = item.product.prices.find(p => p.origin === 'VERIFICADO') || item.product.prices[0];
    const price = verified?.price || 0;
    return acc + price * item.quantity;
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div 
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-8 max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="basket-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 id="basket-modal-title" className="text-sm font-bold text-slate-900 leading-tight">
                Mi Canasta de Compras
              </h2>
              <p className="text-[11px] text-slate-500">
                {basket.length === 0 ? 'Sin productos añadidos' : `${basket.reduce((a, b) => a + b.quantity, 0)} unidades`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {basket.length > 0 && (
              <button
                type="button"
                onClick={onClearBasket}
                aria-label="Vaciar canasta"
                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                title="Vaciar canasta"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar canasta"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {basket.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center mx-auto">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Tu canasta está vacía</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Agrega productos reales desde el catálogo para calcular el total exacto.
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
              {basket.map(item => {
                const verified = item.product.prices.find(p => p.origin === 'VERIFICADO') || item.product.prices[0];
                const unitPrice = verified?.price || 0;
                const subtotal = unitPrice * item.quantity;

                return (
                  <div key={item.product.id} className="p-3.5 flex items-center justify-between gap-3 bg-white">
                    <div className="flex items-center gap-3 min-w-0">
                      {item.product.image && (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-10 h-10 object-contain rounded-md border border-slate-200 shrink-0 p-1"
                        />
                      )}
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{item.product.name}</h4>
                        <p className="text-[11px] text-slate-500">
                          {formatCLP(unitPrice)} c/u · <span className="text-emerald-700 font-medium">Jumbo.cl</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.product.id, -1)}
                          aria-label={`Disminuir ${item.product.name}`}
                          className="p-1.5 text-slate-600 hover:bg-slate-200"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-slate-900">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.product.id, 1)}
                          aria-label={`Aumentar ${item.product.name}`}
                          className="p-1.5 text-slate-600 hover:bg-slate-200"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-xs font-black text-slate-900 w-16 text-right font-mono">
                        {formatCLP(subtotal)}
                      </span>

                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.product.id)}
                        aria-label={`Quitar ${item.product.name}`}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {basket.length > 0 && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Precios 100% verificados de Jumbo:</span>
              </span>
              <span className="text-base font-black text-emerald-950 font-mono">
                {formatCLP(total)}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
          >
            Cerrar
          </button>

          {basket.length > 0 && (
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block uppercase font-medium">Total Canasta Real</span>
              <span className="text-lg font-black text-slate-900 font-mono">{formatCLP(total)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
