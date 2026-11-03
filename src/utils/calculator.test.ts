import test from 'node:test';
import assert from 'node:assert/strict';
import { formatCLP, formatDateTime, findBestPrice } from './calculator';
import { AppProduct } from '../types';

test('formatCLP formats numbers in Chilean pesos, returns Sin datos for null/undefined', () => {
  assert.equal(formatCLP(1180), '$1.180');
  assert.equal(formatCLP(15990), '$15.990');
  assert.equal(formatCLP(null), 'Sin datos');
  assert.equal(formatCLP(undefined), 'Sin datos');
  assert.equal(formatCLP(NaN), 'Sin datos');
});

test('formatDateTime formats ISO strings or falls back cleanly', () => {
  const formatted = formatDateTime('2026-11-03T16:28:07.967Z');
  assert.ok(formatted.includes('2026'));
  assert.equal(formatDateTime(undefined), 'Sin fecha');
});

test('findBestPrice selects lowest price or returns null if no valid prices', () => {
  const prod: AppProduct = {
    id: 'test',
    name: 'Leche Colun Entera 1 L',
    brand: 'Colun',
    category: 'Lácteos',
    image: '',
    firstMeasuredAt: '2026-11-03T16:28:00.000Z',
    prices: [
      {
        storeId: 'jumbo',
        chain: 'Jumbo',
        branchName: 'Jumbo Mall Paseo Costanera',
        price: 1180,
        origin: 'VERIFICADO',
        fetchedAt: '2026-11-03T16:28:00.000Z',
        sourceDetail: 'Jumbo API',
      },
      {
        storeId: 'lider',
        chain: 'Líder',
        branchName: 'Líder Costanera',
        price: null,
        origin: 'SIMULADO',
        fetchedAt: '2026-11-03T16:28:00.000Z',
        sourceDetail: 'Sin datos',
      },
    ],
  };

  const { best, minPrice } = findBestPrice(prod);
  assert.equal(minPrice, 1180);
  assert.equal(best?.storeId, 'jumbo');
});
