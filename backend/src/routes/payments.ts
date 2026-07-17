import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as paymentController from '../controllers/paymentController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { paySchema } from '../validators/payment';

const payLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

export const paymentsRouter = Router();

paymentsRouter.post(
  '/pay',
  payLimiter,
  authenticate,
  authorize('customer'),
  validate(paySchema),
  paymentController.pay,
);
