import React, { useState } from 'react';
import { AppProduct, StorePrice } from '../types';
import { formatCLP, formatDateTime } from '../utils/calculator';
import { OriginBadge } from './OriginBadge';
import { X, ExternalLink, Barcode, Clock, ShoppingBag, Plus, Minus, AlertCircle, ShieldCheck } from 'lucide-react';

interface ProductDetailModalProps {
  product: AppProduct | null;
  onClose: () => void;
  onAddToBasket: (product: AppProduct, quantity: number) => void;
  onOpenReportPrice: (product: AppProduct) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToBasket,
  onOpenReportPrice,
}) => {
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const verifiedPrice = product.prices.find(p => p.origin === 'VERIFICADO') || product.prices[0];
  const verificationUrl = verifiedPrice?.verificationUrl || (product.slug ? `https://www.jumbo.cl/p/${product.slug}` : undefined);

  // EAN rule from TAREA 3:
  // "El comparador solo compara productos con el mismo EAN. Sin EAN, no hay comparación."
  const hasEAN = Boolean(product.barcode && product.barcode.trim() !== '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-8 max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-detail-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-md">
              Fuente de Datos Real
            </span>
            <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
              <Barcode className="w-3.5 h-3.5" />
              {hasEAN ? product.barcode : 'Sin código EAN informado'}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar detalle"
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Hero Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="aspect-square bg-slate-50 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center p-3">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-xs text-slate-400">Sin imagen</span>
              )}
            </div>

            <div className="sm:col-span-2 flex flex-col justify-between">
              <div>
                <div className="text-xs text-slate-500 font-medium space-x-1.5 mb-1.5">
                  <span className="font-bold text-blue-700">{product.brand || 'Marca no informada'}</span>
                  <span>·</span>
                  <span>{product.category || 'Abarrotes'}</span>
                </div>

                <h2 id="product-detail-modal-title" className="text-lg font-bold text-slate-900 leading-snug">
                  {product.name}
                </h2>

                {/* Verification direct link */}
                {verificationUrl && (
                  <div className="mt-2">
                    <a
                      href={verificationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>Verificar este producto en jumbo.cl oficial</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Price Details Box */}
              <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-600 font-medium">Precio Actual:</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900">
                      {formatCLP(verifiedPrice?.price)}
                    </span>
                    {verifiedPrice?.listPrice && verifiedPrice.listPrice > (verifiedPrice.price || 0) && (
                      <span className="text-xs text-slate-400 line-through">
                        {formatCLP(verifiedPrice.listPrice)}
                      </span>
                    )}
                  </div>
                </div>

                {verifiedPrice?.ppumPrice && (
                  <div className="flex items-center justify-between text-xs text-slate-600 border-t border-slate-200 pt-2">
                    <span>Precio por Unidad de Medida (PPUM):</span>
                    <span className="font-bold text-slate-800">
                      {formatCLP(verifiedPrice.ppumPrice)}/{verifiedPrice.ppumMeasurementUnit || 'un'}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-200 pt-2">
                  <span>Origen del Dato:</span>
                  <OriginBadge
                    origin={verifiedPrice?.origin || 'VERIFICADO'}
                    sourceDetail={verifiedPrice?.sourceDetail}
                    author={verifiedPrice?.author}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Primera medición según TAREA 2 (Reemplaza el gráfico de historial inventado) */}
          <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3.5 flex items-center justify-between text-xs text-slate-700">
            <span className="flex items-center gap-1.5 font-semibold text-slate-800">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Registro de auditoría:</span>
            </span>
            <span className="font-mono text-slate-600">
              primera medición: {formatDateTime(product.firstMeasuredAt || verifiedPrice?.fetchedAt)}
            </span>
          </div>

          {/* Comparativa Cross-Supermercados (TAREA 3: Honestidad estricta) */}
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Comparativa entre Supermercados
            </h3>

            {!hasEAN ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Sin código EAN verificado para comparación cruzada.</p>
                  <p className="text-amber-800 leading-relaxed">
                    Siguiendo la política de honestidad estricta (TAREA 3), el comparador solo compara precios entre supermercados si existe un código EAN idéntico verificado. Esto previene comparar por error productos diferentes (como leche entera vs. descremada, o formatos de distinto peso).
                  </p>
                </div>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden text-xs">
                {product.prices.map((p, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between bg-white hover:bg-slate-50">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{p.branchName}</span>
                        <OriginBadge origin={p.origin} sourceDetail={p.sourceDetail} author={p.author} />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Hora de obtención: {formatDateTime(p.fetchedAt)}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black text-slate-900 block">
                        {p.price !== null ? formatCLP(p.price) : 'sin datos'}
                      </span>
                      {p.origin === 'SIMULADO' && (
                        <span className="text-[10px] text-slate-400 italic block">Sin fuente real verificada</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              onOpenReportPrice(product);
              onClose();
            }}
            className="text-xs font-semibold text-slate-700 hover:text-blue-700 underline underline-offset-2"
          >
            Añadir reporte local (solo en este dispositivo)
          </button>

          <div className="flex items-center gap-3">
            <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                aria-label="Disminuir cantidad"
                className="p-2 text-slate-600 hover:bg-slate-100"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-3 text-xs font-bold text-slate-900">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                aria-label="Aumentar cantidad"
                className="p-2 text-slate-600 hover:bg-slate-100"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                onAddToBasket(product, quantity);
                onClose();
              }}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-2 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Agregar a Canasta ({formatCLP((verifiedPrice?.price || 0) * quantity)})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
