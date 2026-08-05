import { Router } from 'express';
import * as addressController from '../controllers/addressController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createAddressSchema } from '../validators/address';

export const addressesRouter = Router();

addressesRouter.use(authenticate);

addressesRouter.get('/', addressController.listMine);
addressesRouter.post('/', validate(createAddressSchema), addressController.create);
addressesRouter.delete('/:id', addressController.remove);
