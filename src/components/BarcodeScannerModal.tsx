import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, Upload, Zap, Barcode, CheckCircle2, RefreshCw } from 'lucide-react';
import { AppProduct } from '../types';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBarcodeDetected: (barcode: string) => void;
  products: AppProduct[];
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onBarcodeDetected,
  products,
}) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [detectedFeedback, setDetectedFeedback] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // EAN codes for verification testing
  const sampleBarcodes = [
    { name: 'Leche Colun Entera 1 L', code: '7801610001017' },
    { name: 'Arroz Tucapel G2 1 kg', code: '7801875001234' },
    { name: 'Aceite Chef 900 ml', code: '7802100002159' },
    { name: 'Café Nescafé 170 g', code: '7801620003414' },
  ];

  const handleDetected = (code: string) => {
    const clean = code.trim();
    if (!clean) return;
    setDetectedFeedback(clean);
    stopCamera();
    setTimeout(() => {
      onBarcodeDetected(clean);
      setDetectedFeedback(null);
    }, 500);
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraActive(false);
        setCameraError('Cámara no detectada en este dispositivo. Puedes ingresar el código numérico manualmente.');
        return;
      }

      if (navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasCamera = devices.some(d => d.kind === 'videoinput');
        if (!hasCamera) {
          setCameraActive(false);
          setCameraError('Sin cámara de video conectada. Usa el ingreso manual de EAN o los códigos de prueba.');
          return;
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
        startDetectionLoop();
      }
    } catch (err: any) {
      setCameraError('No se pudo acceder a la cámara. Puedes ingresar el número EAN manualmente.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const startDetectionLoop = () => {
    const BarcodeDetectorClass = (window as any).BarcodeDetector;
    if (BarcodeDetectorClass) {
      const detector = new BarcodeDetectorClass({
        formats: ['ean_13', 'ean_8', 'upc_a', 'code_128'],
      });

      const loop = async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) {
          animFrameRef.current = requestAnimationFrame(loop);
          return;
        }
        try {
          const codes = await detector.detect(videoRef.current);
          if (codes && codes.length > 0 && codes[0].rawValue) {
            handleDetected(codes[0].rawValue);
            return;
          }
        } catch {
          // loop
        }
        animFrameRef.current = requestAnimationFrame(loop);
      };
      animFrameRef.current = requestAnimationFrame(loop);
    }
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-8 flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="Escáner de código de barras EAN"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Barcode className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">Escáner de Código de Barras</h2>
              <p className="text-[11px] text-slate-500">Búsqueda exacta por código EAN</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar escáner"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="relative aspect-[4/3] bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center text-center p-4">
            {cameraActive ? (
              <>
                <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-56 h-28 border-2 border-dashed border-white/80 rounded-lg" />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Camera className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-xs text-slate-400">
                  {cameraError || 'Iniciando cámara...'}
                </p>
              </div>
            )}

            {detectedFeedback && (
              <div className="absolute inset-0 bg-emerald-600/90 text-white flex flex-col items-center justify-center">
                <CheckCircle2 className="w-10 h-10 mb-1 animate-bounce" />
                <p className="text-xs font-bold font-mono">EAN: {detectedFeedback}</p>
                <p className="text-[11px] text-emerald-100 mt-1">Buscando precio verificado...</p>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="barcode-input" className="block text-xs font-bold text-slate-700 mb-1">
              Ingresar código de barras EAN manual:
            </label>
            <div className="flex gap-2">
              <input
                id="barcode-input"
                type="text"
                value={manualCode}
                onChange={e => setManualCode(e.target.value.replace(/\D/g, ''))}
                placeholder="Ej. 7801610001017"
                className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => {
                  if (manualCode) handleDetected(manualCode);
                }}
                disabled={!manualCode}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Buscar
              </button>
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Probar con códigos EAN de referencia:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {sampleBarcodes.map(s => (
                <button
                  key={s.code}
                  type="button"
                  onClick={() => handleDetected(s.code)}
                  className="p-2 text-left bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg transition-colors"
                >
                  <p className="text-xs font-semibold text-slate-800 truncate">{s.name}</p>
                  <p className="text-[10px] text-slate-500 font-mono">{s.code}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
