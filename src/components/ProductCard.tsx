import React from 'react';
import { AppProduct } from '../types';
import { formatCLP, formatDateTime } from '../utils/calculator';
import { OriginBadge } from './OriginBadge';
import { ExternalLink, Barcode, ShoppingBag, Eye, Clock } from 'lucide-react';

interface ProductCardProps {
  product: AppProduct;
  onSelect: (product: AppProduct) => void;
  onAddToBasket: (product: AppProduct) => void;
  inBasketCount?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onAddToBasket,
  inBasketCount = 0,
}) => {
  // Jumbo verified price
  const verifiedPrice = product.prices.find(p => p.origin === 'VERIFICADO') || product.prices[0];
  const hasMultiplePrices = product.prices.length > 1;

  const price = verifiedPrice?.price;
  const listPrice = verifiedPrice?.listPrice;
  const ppumPrice = verifiedPrice?.ppumPrice;
  const ppumUnit = verifiedPrice?.ppumMeasurementUnit;
  const fetchedAt = verifiedPrice?.fetchedAt;
  const verificationUrl = verifiedPrice?.verificationUrl || (product.slug ? `https://www.jumbo.cl/p/${product.slug}` : undefined);

  return (
    <div className="bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden">
      {/* Product Image & Badges */}
      <div className="relative aspect-[4/3] bg-slate-50 overflow-hidden cursor-pointer" onClick={() => onSelect(product)}>
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-contain p-2 hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
            Sin imagen
          </div>
        )}

        {/* EAN / Barcode status badge */}
        <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded flex items-center gap-1 shadow-xs">
          <Barcode className="w-3 h-3" />
          <span>{product.barcode ? product.barcode : 'Sin EAN'}</span>
        </div>

        {/* Origin tag */}
        <div className="absolute top-2 right-2">
          {verifiedPrice && (
            <OriginBadge
              origin={verifiedPrice.origin}
              sourceDetail={verifiedPrice.sourceDetail}
              author={verifiedPrice.author}
            />
          )}
        </div>
      </div>

      {/* Product Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
            <span className="font-bold text-blue-700">{product.brand || 'Marca no informada'}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{product.category || 'Abarrotes'}</span>
          </div>

          {/* Product Name */}
          <h3
            className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-2 cursor-pointer leading-snug"
            onClick={() => onSelect(product)}
            title={product.name}
          >
            {product.name}
          </h3>
        </div>

        {/* Pricing Box (Strictly Real Data) */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-medium">
                Precio en Jumbo.cl
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-slate-900 tracking-tight">
                  {formatCLP(price)}
                </span>
                {listPrice && listPrice > (price || 0) && (
                  <span className="text-xs text-slate-400 line-through">
                    {formatCLP(listPrice)}
                  </span>
                )}
              </div>
            </div>

            {ppumPrice !== null && ppumPrice !== undefined && ppumPrice > 0 && (
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-medium">Precio por unidad (PPUM)</span>
                <span className="text-xs font-semibold text-slate-700">
                  {formatCLP(ppumPrice)}/{ppumUnit || 'un'}
                </span>
              </div>
            )}
          </div>

          {/* Timestamp de obtención de la API */}
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1 text-[10px] text-slate-500">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Obtenido: {formatDateTime(fetchedAt)}</span>
            </span>

            {/* Direct Verification Link to jumbo.cl */}
            {verificationUrl && (
              <a
                href={verificationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-0.5"
                title="Abrir página oficial de Jumbo para verificar este precio a mano"
              >
                <span>Ver en jumbo.cl</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>

          {/* Actions */}
          <div className="mt-3.5 flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSelect(product)}
              className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-slate-600" />
              <span>Ver detalle y fuentes</span>
            </button>

            <button
              type="button"
              onClick={() => onAddToBasket(product)}
              aria-label={`Agregar ${product.name} a la canasta`}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors shadow-xs ${
                inBasketCount > 0
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              {inBasketCount > 0 && <span className="ml-1 text-[11px]">{inBasketCount}</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
