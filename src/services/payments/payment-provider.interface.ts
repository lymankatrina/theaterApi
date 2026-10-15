import type { PaymentVerification } from '../../types/payments.types';

export interface PaymentProviderService {
  verifyPayment(paymentId: string): Promise<PaymentVerification>;
}
