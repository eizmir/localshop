import { NextFunction, Request, Response, Router } from 'express';
import { listSellers } from '../services/sellerService';

export const sellersRouter = Router();

sellersRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await listSellers());
  } catch (err) {
    next(err);
  }
});
