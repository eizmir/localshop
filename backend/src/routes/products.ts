import { Router } from 'express';
import * as productController from '../controllers/productController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createProductSchema, updateProductSchema } from '../validators/product';

export const productsRouter = Router();

productsRouter.get('/seller/me', authenticate, authorize('seller'), productController.mine);

productsRouter.get('/', productController.list);
productsRouter.get('/:id', productController.getOne);

productsRouter.post(
  '/',
  authenticate,
  authorize('seller'),
  validate(createProductSchema),
  productController.create,
);
productsRouter.put(
  '/:id',
  authenticate,
  authorize('seller'),
  validate(updateProductSchema),
  productController.update,
);
productsRouter.delete('/:id', authenticate, authorize('seller'), productController.remove);
