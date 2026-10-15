import { Request, Response } from 'express';

import type { CompletePaymentInput } from '../dto/payments.dto';
import { completePayment } from '../services/payments/payments.service';
import { AppError } from '../errors/app.error';

export class PaymentsController {
  completePayment = async (req: Request, res: Response): Promise<void> => {
    const user = req.currentUser;

    if (!user) {
      res.status(401).json({
        message: 'User not authenticated'
      });
      return;
    }
    const input: CompletePaymentInput = req.body;

    try {
      const order = await completePayment(input, user);
      res.status(200).json(order);
    } catch (error) {
      console.error('Error completing payment:', error);

      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          message: error.message
        });
        return;
      }

      res.status(500).json({
        message: 'Unable to complete payment'
      });
    }
  };
}
