export const SALES_CHANNELS = ['online', 'window', 'concession'] as const;

export type SalesChannel = (typeof SALES_CHANNELS)[number];
