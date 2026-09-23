export const SHOWTIME_TYPES = ['matinee', 'premier', 'standard'] as const;

export type ShowtimeType = (typeof SHOWTIME_TYPES)[number];
