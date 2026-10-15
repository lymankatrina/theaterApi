export const PAYMENT_PROVIDERS = ['square'] as const;

export type PaymentProvider = (typeof PAYMENT_PROVIDERS)[number];

export const PAYMENT_STATUSES = ['pending', 'completed', 'failed'] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export interface PaymentVerification {
  paymentId: string;
  paymentProvider: PaymentProvider;
  status: PaymentStatus;
  amountInCents: number;
}
