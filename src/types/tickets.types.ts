export const TICKET_STATUS_TYPES = ['available', 'reserved', 'sold'] as const;

export type TicketStatus = (typeof TICKET_STATUS_TYPES)[number];

export const ADMISSION_TYPES = ['adult', 'child', 'student', 'military', 'senior'] as const;

export type AdmissionTypes = (typeof ADMISSION_TYPES)[number];
