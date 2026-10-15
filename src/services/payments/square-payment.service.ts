import { SquareClient, SquareEnvironment } from 'square';

import type { PaymentProviderService } from './payment-provider.interface';
import type { PaymentVerification } from '../../types/payments.types';
import { getEnv } from '../../config/env';

const squareClient = new SquareClient({
  token: getEnv('SQUARE_ACCESS_TOKEN'),
  environment: SquareEnvironment.Sandbox
});

export class SquarePaymentService implements PaymentProviderService {
  async verifyPayment(paymentId: string): Promise<PaymentVerification> {
    const response = await squareClient.payments.get({
      paymentId
    });

    const payment = response.payment;

    if (!payment) {
      throw new Error('Square payment not found');
    }

    if (!payment.id) {
      throw new Error('Square payment ID is missing');
    }

    if (payment.amountMoney?.amount === undefined) {
      throw new Error('Square payment amount is mission');
    }

    let status: PaymentVerification['status'];

    switch (payment.status) {
      case 'COMPLETED':
        status = 'completed';
        break;
      case 'FAILED':
      case 'CANCELED':
        status = 'failed';
        break;
      default:
        status = 'pending';
    }

    const amountInCents = Number(payment.amountMoney.amount);

    return {
      paymentId: payment.id,
      paymentProvider: 'square',
      status,
      amountInCents,
      orderReference: payment.referenceId
    };
  }
}
