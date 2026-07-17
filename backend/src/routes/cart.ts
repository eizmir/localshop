import { Router } from 'express';
import * as cartController from '../controllers/cartController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { addCartItemSchema, updateCartItemSchema } from '../validators/cart';

export const cartRouter = Router();

cartRouter.use(authenticate, authorize('customer'));

cartRouter.get('/', cartController.get);
cartRouter.post('/items', validate(addCartItemSchema), cartController.addItem);
cartRouter.patch('/items/:productId', validate(updateCartItemSchema), cartController.updateItem);
cartRouter.delete('/items/:productId', cartController.removeItem);
