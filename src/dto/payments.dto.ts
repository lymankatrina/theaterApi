import type { PaymentProvider } from '../types/payments.types';

export interface CompletePaymentInput {
  orderId: string;
  paymentProvider: PaymentProvider;
  paymentId: string;
}
