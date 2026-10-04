export const TICKET_STATUS_TYPES = ['available', 'reserved', 'sold'] as const;

export type TicketStatus = (typeof TICKET_STATUS_TYPES)[number];
