export const SALES_CHANNELS = ['online', 'ticket-window', 'concession-stand'] as const;

export type SalesChannel = (typeof SALES_CHANNELS)[number];
