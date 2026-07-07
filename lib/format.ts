// app/lib/format.ts

/**
 * Formatea un número como moneda en pesos colombianos (COP)
 * @param value - Número a formatear
 * @returns String con formato de moneda (ej. "$1.234.567")
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value).replace('COP', '').trim();
};