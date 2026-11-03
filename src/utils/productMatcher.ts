export interface ProductMatchInfo {
  name: string;
  brand?: string;
  quantity?: string | number;
  quantityUnit?: string;
  ean?: string;
}

/**
 * Normaliza el nombre del producto según TAREA 4:
 * - minúsculas
 * - sin tildes
 * - sin puntuación
 * - unidades normalizadas (lt→l, gr→g, kg→kg, ml→ml)
 * - espacios colapsados
 */
export function normalizeProductName(name: string): string {
  if (!name) return '';
  let str = name.toLowerCase();

  // Remover tildes
  str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Normalizar unidades como palabras independientes
  str = str.replace(/\b(lts?|litros?)\b/g, 'l');
  str = str.replace(/\b(grs?|gramos?)\b/g, 'g');
  str = str.replace(/\b(kgs?|kilos?|kilogramos?)\b/g, 'kg');
  str = str.replace(/\b(mls?|mililitros?|cc)\b/g, 'ml');

  // Remover puntuación (conservar letras, números, espacios y ñ)
  str = str.replace(/[^\w\sñ]/g, ' ');

  // Normalizar unidades pegadas a números (ej: 1lt -> 1 l, 900gr -> 900 g, 1kg -> 1 kg)
  str = str.replace(/(\d+)\s*(lt|lts|l)\b/g, '$1 l');
  str = str.replace(/(\d+)\s*(gr|grs|g)\b/g, '$1 g');
  str = str.replace(/(\d+)\s*(kg|kgs)\b/g, '$1 kg');
  str = str.replace(/(\d+)\s*(ml|mls|cc)\b/g, '$1 ml');

  // Colapsar espacios y recortar
  return str.replace(/\s+/g, ' ').trim();
}

/**
 * Normaliza la marca para comparación
 */
export function normalizeBrand(brand?: string): string {
  if (!brand) return '';
  return brand.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

/**
 * Extrae o normaliza la cantidad para comparación
 */
export function extractNormalizedQuantity(p: ProductMatchInfo): string {
  if (p.quantity !== undefined && p.quantityUnit) {
    const unit = p.quantityUnit.toLowerCase().replace(/lt/g, 'l').replace(/gr/g, 'g');
    return `${p.quantity} ${unit}`.trim();
  }
  // Si no está separada, intentar extraer del nombre (ej: "1 l", "900 g", "1 kg")
  const norm = normalizeProductName(p.name);
  const match = norm.match(/\b(\d+(?:\.\d+)?)\s*(l|kg|g|ml|un)\b/);
  if (match) {
    return `${match[1]} ${match[2]}`;
  }
  return '';
}

/**
 * Matching de productos según TAREA 4:
 * - mismo EAN si existe en ambos (o si al menos uno existe y coincide)
 * - si no, mismo nombre normalizado + misma marca + misma cantidad
 */
export function matchProducts(a: ProductMatchInfo, b: ProductMatchInfo): boolean {
  // 1. Si ambos tienen EAN válido y no vacío
  if (a.ean && b.ean && a.ean.trim() !== '' && b.ean.trim() !== '') {
    return a.ean.trim() === b.ean.trim();
  }

  // 2. Si uno tiene EAN y el otro no (o ninguno tiene EAN):
  // Evaluar nombre normalizado + marca + cantidad
  const normA = normalizeProductName(a.name);
  const normB = normalizeProductName(b.name);

  if (normA !== normB) {
    return false;
  }

  // Verificar marca si ambas están provistas
  if (a.brand && b.brand) {
    if (normalizeBrand(a.brand) !== normalizeBrand(b.brand)) {
      return false;
    }
  }

  // Verificar cantidad
  const qtyA = extractNormalizedQuantity(a);
  const qtyB = extractNormalizedQuantity(b);

  if (qtyA && qtyB && qtyA !== qtyB) {
    return false;
  }

  return true;
}
