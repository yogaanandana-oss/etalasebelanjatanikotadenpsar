import { differenceInCalendarDays, format } from 'date-fns';

export const formatIDR = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

export const formatShortDate = (dateStr) => {
  try {
    return format(new Date(dateStr), 'd MMM');
  } catch {
    return dateStr;
  }
};

export const daysUntil = (dateStr) => {
  const today = new Date('2026-09-15T00:00:00');
  return differenceInCalendarDays(new Date(dateStr), today);
};

export const daysSince = (dateStr) => {
  const today = new Date('2026-09-15T00:00:00');
  return differenceInCalendarDays(today, new Date(dateStr));
};

export const hasDiscount = (p) => !!p && Number(p.discount_percent) > 0;

export const finalPrice = (p) => {
  if (!p) return 0;
  const d = Number(p.discount_percent) || 0;
  return d > 0 ? Math.round(p.price * (1 - d / 100)) : p.price;
};