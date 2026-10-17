export const TAX_TYPES = ['standard', 'grocery'] as const;
export type TaxType = (typeof TAX_TYPES)[number];

export const TAX_RATES: Record<TaxType, number> = {
  standard: 0.0675,
  grocery: 0.03
};
