export function formatCurrency(amount: number | string | undefined | null): string {
  const value = Number(amount || 0);
  return `${value.toLocaleString('en-EG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} EGP`;
}
