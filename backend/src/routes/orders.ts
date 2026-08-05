import { Router } from 'express';
import * as orderController from '../controllers/orderController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createOrderSchema, updateOrderStatusSchema } from '../validators/order';

export const ordersRouter = Router();

ordersRouter.use(authenticate);

ordersRouter.get('/seller/me', authorize('seller'), orderController.listForSeller);
ordersRouter.patch(
  '/:id/status',
  authorize('seller'),
  validate(updateOrderStatusSchema),
  orderController.updateStatus,
);
ordersRouter.post('/', authorize('customer'), validate(createOrderSchema), orderController.create);
ordersRouter.get('/', authorize('customer'), orderController.listMine);
ordersRouter.get('/:id', authorize('customer'), orderController.getOne);
