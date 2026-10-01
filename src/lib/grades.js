import { finalPrice } from '@/lib/format';

// Grade helpers. Products without `grades` behave exactly as before.

export const getGrades = (p) => (p && Array.isArray(p.grades) ? p.grades.filter(Boolean) : []);

export const hasGrades = (p) => getGrades(p).length > 0;

// Price for one grade, applying the product discount if any.
export const gradePrice = (p, grade) => {
  if (!grade) return 0;
  const d = Number(p?.discount_percent) || 0;
  const base = Number(grade.price) || 0;
  return d > 0 ? Math.round(base * (1 - d / 100)) : base;
};

// Lowest grade price — for "mulai dari" on cards.
export const minGradePrice = (p) => {
  const g = getGrades(p);
  if (!g.length) return null;
  return Math.min(...g.map((x) => gradePrice(p, x)));
};

// True when a graded product is sold by weight (grades carry weight_kg).
export const isWeightGraded = (p) => {
  const g = getGrades(p);
  return g.length > 0 && g.every((x) => Number(x.weight_kg) > 0);
};

// True when the buyer must input the fruit weight and the final price is
// computed as (grade per-kg price × weight). Tier pricing by weight.
export const isWeightPriced = (p) => !!(p && p.weight_priced);

// Lowest per-kg price across grades — for weight-graded cards shown as "per kg".
export const minGradePerKgPrice = (p) => {
  const g = getGrades(p);
  if (!g.length) return null;
  return Math.min(...g.map((x) => Math.round(gradePrice(p, x) / Number(x.weight_kg))));
};

// Default selected grade = the largest (highest price).
export const defaultGrade = (p) => {
  const g = getGrades(p);
  if (!g.length) return null;
  return [...g].sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0))[0];
};

// Per-kg price for a weight-priced grade (same as gradePrice, named for clarity).
export const gradePerKgPrice = (p, grade) => gradePrice(p, grade);

// Price actually charged for a cart line item (grade-aware).
// For weight-priced products: grade per-kg price × buyer-entered weight.
export const effectivePrice = (item) => {
  if (!item || !item.product) return 0;
  if (item.grade) {
    const perKg = gradePrice(item.product, item.grade);
    if (isWeightPriced(item.product)) {
      const w = Number(item.weight) || 0;
      return Math.round(perKg * w);
    }
    return perKg;
  }
  return finalPrice(item.product);
};

// Stable identity for a cart line: same product + different grade = separate line.
// For weight-priced products, different weights are also separate lines.
export const itemKey = (item) => {
  if (!item?.product?.id) return '';
  let k = item.product.id;
  if (item.grade) k += `::${item.grade.label}`;
  if (isWeightPriced(item.product) && item.weight) k += `::${item.weight}`;
  return k;
};

export const gradeWeightLabel = (grade) => {
  const w = Number(grade?.weight_kg);
  return w ? `±${w} kg` : '';
};

export const gradeFullLabel = (grade) => {
  if (!grade) return '';
  const w = gradeWeightLabel(grade);
  const en = grade.label_en ? ` / ${grade.label_en}` : '';
  return `${grade.label || ''}${en}${w ? ' · ' + w : ''}`;
};