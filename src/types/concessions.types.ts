export const CONCESSION_CATEGORIES = ['popcorn', 'drink', 'candy', 'food', 'other'] as const;

export type ConcessionCategory = (typeof CONCESSION_CATEGORIES)[number];
