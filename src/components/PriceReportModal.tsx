import React, { useState } from 'react';
import { AppProduct } from '../types';
import { X, CheckCircle2, User, UploadCloud } from 'lucide-react';

interface PriceReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: AppProduct | null;
  onSaveReport: (productId: string, reportedPrice: number, authorName: string, storeName: string) => void;
}

export const PriceReportModal: React.FC<PriceReportModalProps> = ({
  isOpen,
  onClose,
  product,
  onSaveReport,
}) => {
  const [price, setPrice] = useState('');
  const [authorName, setAuthorName] = useState('Vecino de Puerto Montt');
  const [storeName, setStoreName] = useState('Supermercado Local Puerto Montt');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = parseInt(price.replace(/\D/g, ''), 10);
    if (!parsedPrice || parsedPrice <= 0) {
      alert('Por favor ingresa un precio válido en pesos ($ CLP).');
      return;
    }

    onSaveReport(product.id, parsedPrice, authorName.trim() || 'Vecino local', storeName.trim());
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
      setPrice('');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-8 max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h2 id="report-modal-title" className="text-sm font-bold text-slate-900 leading-tight">
                Reporte Local de Precio
              </h2>
              <p className="text-[11px] text-amber-700 font-medium">
                (Solo en este dispositivo · Origen REPORTADO)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar reporte"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
            <h3 className="text-base font-bold text-slate-900">¡Precio guardado en este dispositivo!</h3>
            <p className="text-xs text-slate-500">
              Se ha añadido a la comparativa con la etiqueta REPORTADO.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Producto</span>
              <p className="font-bold text-slate-900 mt-0.5">{product.name}</p>
              <p className="text-slate-500">{product.brand}</p>
            </div>

            <div>
              <label htmlFor="reported-price-input" className="text-xs font-bold text-slate-800 block mb-1">
                Precio que viste en góndola ($ CLP) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">$</span>
                <input
                  id="reported-price-input"
                  type="text"
                  placeholder="Ej. 1.250"
                  value={price}
                  onChange={e => setPrice(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="store-name-input" className="text-xs font-semibold text-slate-700 block mb-1">
                Supermercado o local donde lo viste
              </label>
              <input
                id="store-name-input"
                type="text"
                placeholder="Ej. Líder Hiper Costanera, Unimarc Benavente..."
                value={storeName}
                onChange={e => setStoreName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div>
              <label htmlFor="author-input" className="text-xs font-semibold text-slate-700 block mb-1">
                Tu nombre o identificador (para autoría del dato)
              </label>
              <input
                id="author-input"
                type="text"
                placeholder="Ej. Juan P., Vecino Cardonal..."
                value={authorName}
                onChange={e => setAuthorName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
              <strong>Nota de transparencia (TAREA 5):</strong> Este precio se almacena localmente en el navegador de tu dispositivo (`localStorage`) con etiqueta <strong>REPORTADO</strong> y fecha de hoy. No afecta los datos oficiales verificados de la API.
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                Guardar Reporte Local
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
