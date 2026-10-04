import type { AdmissionType } from '../types/prices.types';
import type { SalesChannel } from '../types/cart.types';

export interface CreateCartInput {
  salesChannel: SalesChannel;
}

export interface AddTicketToCartInput {
  ticketId: string;
  admissionType: AdmissionType;
}

export interface UpdateCartTicketInput {
  admissionType: AdmissionType;
}

export interface AddConcessionToCartInput {
  concessionId: string;
  quantity: number;
}

export interface UpdateConcessionQuantityInput {
  quantity: number;
}
