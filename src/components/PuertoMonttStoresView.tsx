import React from 'react';
import { MapPin, AlertCircle, Building2 } from 'lucide-react';

interface LocalStoreRef {
  id: string;
  chain: string;
  name: string;
  address: string;
  sector: string;
  verifiedSource: boolean;
}

const PUERTO_MONTT_KNOWN_LOCATIONS: LocalStoreRef[] = [
  {
    id: 'jumbo_costanera',
    chain: 'Jumbo (Cencosud)',
    name: 'Jumbo Mall Paseo Costanera',
    address: 'Illapel 10, Mall Paseo Costanera, Puerto Montt',
    sector: 'Centro / Costanera',
    verifiedSource: true, // Jumbo API active in app
  },
  {
    id: 'lider_costanera',
    chain: 'Líder (Walmart Chile)',
    name: 'Líder Hiper Costanera',
    address: 'Av. Diego Portales 2000, Mall Paseo Costanera',
    sector: 'Centro / Costanera',
    verifiedSource: false,
  },
  {
    id: 'lider_cardonal',
    chain: 'Líder (Walmart Chile)',
    name: 'Express de Líder Cardonal',
    address: 'Ruta 5 Sur / Av. Cardonal s/n',
    sector: 'Cardonal / Ruta 5',
    verifiedSource: false,
  },
  {
    id: 'santa_isabel_ibanez',
    chain: 'Santa Isabel (Cencosud)',
    name: 'Santa Isabel Presidente Ibáñez',
    address: 'Av. Presidente Ibáñez 600, Puerto Montt',
    sector: 'Presidente Ibáñez',
    verifiedSource: false,
  },
  {
    id: 'unimarc_benavente',
    chain: 'Unimarc (SMU)',
    name: 'Unimarc Benavente Centro',
    address: 'Benavente 840, Centro Puerto Montt',
    sector: 'Centro',
    verifiedSource: false,
  },
  {
    id: 'mayorista10_ibanez',
    chain: 'Mayorista 10 (SMU)',
    name: 'Mayorista 10 Presidente Ibáñez',
    address: 'Av. Presidente Ibáñez 345, Puerto Montt',
    sector: 'Presidente Ibáñez',
    verifiedSource: false,
  },
];

export const PuertoMonttStoresView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Disclaimer Banner adhering to TAREA 5 */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 space-y-1">
          <p className="font-bold">Aviso de Honestidad de Datos (TAREA 5):</p>
          <p className="text-amber-800 leading-relaxed">
            Las ubicaciones a continuación corresponden a direcciones físicas conocidas en Puerto Montt como <strong>EJEMPLO DE REFERENCIA</strong>. Para mantener la política estricta de no inventar datos, no mostramos horarios ni teléfonos ficticios, ya que actualmente solo los precios de <strong>Jumbo</strong> provienen de una API oficial en tiempo real.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PUERTO_MONTT_KNOWN_LOCATIONS.map(store => (
          <div
            key={store.id}
            className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{store.name}</h3>
                  <p className="text-xs text-blue-700 font-medium">{store.chain}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  store.verifiedSource
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  {store.verifiedSource ? 'API ACTIVA' : 'REFERENCIA'}
                </span>
              </div>

              <div className="mt-3 text-xs text-slate-600 space-y-1.5 border-t border-slate-100 pt-2.5">
                <p className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{store.address}</span>
                </p>
                <p className="text-[11px] text-slate-400 pl-5">
                  Sector: {store.sector}
                </p>
                <p className="text-[10px] text-slate-400 italic pl-5">
                  Horarios: sin datos en API oficial
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
