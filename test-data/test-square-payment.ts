import { randomUUID } from 'node:crypto';
import { SquareClient, SquareEnvironment } from 'square';

import { getEnv } from '../src/config/env';
import { SquarePaymentService } from '../src/services/payments/square-payment.service';

const squareClient = new SquareClient({
  token: getEnv('SQUARE_ACCESS_TOKEN'),
  environment: SquareEnvironment.Sandbox
});

const squarePaymentService = new SquarePaymentService();

const createTestPayment = async () => {
  const response = await squareClient.payments.create({
    sourceId: 'cnon:card-nonce-ok',
    idempotencyKey: randomUUID(),
    amountMoney: {
      amount: BigInt(2989),
      currency: 'USD'
    }
  });

  console.log(response.payment);

  const paymentId = response.payment?.id;

  if (!paymentId) {
    throw new Error('Test payment ID was not returned');
  }

  const verification = await squarePaymentService.verifyPayment(paymentId);

  console.log('Payment verification:', verification);
};

createTestPayment().catch((error) => {
  console.error('Error creating test payment:', error);
});
