import { SquareClient } from 'square';
import { squareConfig } from '../../config/square.config';

import type { PaymentProviderService } from './payment-provider.interface';
import type { PaymentVerification } from '../../types/payments.types';

const squareClient = new SquareClient(squareConfig);

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
      throw new Error('Square payment amount is missing');
    }

    if (!payment.amountMoney?.currency) {
      throw new Error('Square payment currency is missing');
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
      currency: payment.amountMoney.currency,
      orderReference: payment.referenceId
    };
  }
}
