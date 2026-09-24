import type { TicketStatus } from '../types/tickets.types';

export interface UpdateTicketInput {
  status?: TicketStatus;
}
