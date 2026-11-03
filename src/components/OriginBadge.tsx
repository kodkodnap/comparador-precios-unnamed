import React from 'react';
import { PriceOrigin } from '../types';
import { CheckCircle2, User, AlertTriangle } from 'lucide-react';

interface OriginBadgeProps {
  origin: PriceOrigin;
  timestamp?: string;
  sourceDetail?: string;
  author?: string;
}

export const OriginBadge: React.FC<OriginBadgeProps> = ({
  origin,
  timestamp,
  sourceDetail,
  author,
}) => {
  if (origin === 'VERIFICADO') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
        <span>VERIFICADO</span>
        <span className="text-emerald-400">·</span>
        <span className="font-normal text-emerald-700">{sourceDetail || 'API Jumbo'}</span>
      </span>
    );
  }

  if (origin === 'REPORTADO') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
        <User className="w-3 h-3 text-amber-600 shrink-0" />
        <span>REPORTADO</span>
        <span className="text-amber-400">·</span>
        <span className="font-normal text-amber-700">{author || 'Local (este dispositivo)'}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-dashed border-slate-300">
      <AlertTriangle className="w-3 h-3 text-slate-500 shrink-0" />
      <span>SIMULADO</span>
      <span className="text-slate-400">·</span>
      <span className="font-normal text-slate-500">Demo (sin fuente real)</span>
    </span>
  );
};
