import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeProductName, matchProducts } from './productMatcher';

test('normalizeProductName normalizes casing, accents, punctuation, and units', () => {
  assert.equal(normalizeProductName('Leche Colun Entera 1 L'), 'leche colun entera 1 l');
  assert.equal(normalizeProductName('Leche Colun entera 1 lt'), 'leche colun entera 1 l');
  assert.equal(normalizeProductName('Café Nescafé Tradición 170gr.'), 'cafe nescafe tradicion 170 g');
  assert.equal(normalizeProductName('Arroz Tucapel Grano Largo 1kg!'), 'arroz tucapel grano largo 1 kg');
});

test('matchProducts: Leche Colun Entera 1 L vs Leche Colun entera 1 lt → match', () => {
  const a = { name: 'Leche Colun Entera 1 L', brand: 'Colun' };
  const b = { name: 'Leche Colun entera 1 lt', brand: 'Colun' };
  assert.equal(matchProducts(a, b), true);
});

test('matchProducts: Leche Colun Entera 1 L vs Leche Colun Descremada 1 L → NO match', () => {
  const a = { name: 'Leche Colun Entera 1 L', brand: 'Colun' };
  const b = { name: 'Leche Colun Descremada 1 L', brand: 'Colun' };
  assert.equal(matchProducts(a, b), false);
});

test('matchProducts: Arroz Tucapel 1 kg vs Arroz Tucapel 900 g → NO match', () => {
  const a = { name: 'Arroz Tucapel 1 kg', brand: 'Tucapel', quantity: 1, quantityUnit: 'kg' };
  const b = { name: 'Arroz Tucapel 900 g', brand: 'Tucapel', quantity: 900, quantityUnit: 'g' };
  assert.equal(matchProducts(a, b), false);
});

test('matchProducts: same EAN matches immediately', () => {
  const a = { name: 'Leche', ean: '7801610001017' };
  const b = { name: 'Leche Entera Colun', ean: '7801610001017' };
  assert.equal(matchProducts(a, b), true);
});

test('matchProducts: different EAN does not match', () => {
  const a = { name: 'Leche Colun Entera 1 L', ean: '7801610001017' };
  const b = { name: 'Leche Colun Entera 1 L', ean: '7801610002021' };
  assert.equal(matchProducts(a, b), false);
});
