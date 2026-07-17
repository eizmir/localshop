import { NextFunction, Request, Response } from 'express';
import * as paymentService from '../services/paymentService';

export async function pay(req: Request, res: Response, next: NextFunction) {
  try {
    const { orderId, cardNumber, cardHolder, expiry, cvv } = req.body;
    const result = await paymentService.payOrder(req.user!.id, orderId, {
      cardNumber,
      cardHolder,
      expiry,
      cvv,
    });
    res.status(result.success ? 200 : 402).json(result);
  } catch (err) {
    next(err);
  }
}
