import { Router } from 'express';
import * as orderController from '../controllers/orderController';
import { authenticate, authorize } from '../middleware/auth';

export const ordersRouter = Router();

ordersRouter.use(authenticate);

ordersRouter.get('/seller/me', authorize('seller'), orderController.listForSeller);
ordersRouter.post('/', authorize('customer'), orderController.create);
ordersRouter.get('/', authorize('customer'), orderController.listMine);
ordersRouter.get('/:id', authorize('customer'), orderController.getOne);
