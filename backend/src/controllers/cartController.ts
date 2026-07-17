import { NextFunction, Request, Response } from 'express';
import * as cartService from '../services/cartService';

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await cartService.getCart(req.user!.id));
  } catch (err) {
    next(err);
  }
}

export async function addItem(req: Request, res: Response, next: NextFunction) {
  try {
    const { productId, quantity } = req.body;
    res.status(201).json(await cartService.addItem(req.user!.id, productId, quantity));
  } catch (err) {
    next(err);
  }
}

export async function updateItem(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(
      await cartService.updateItem(
        req.user!.id,
        String(req.params.productId),
        req.body.quantity,
      ),
    );
  } catch (err) {
    next(err);
  }
}

export async function removeItem(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await cartService.removeItem(req.user!.id, String(req.params.productId)));
  } catch (err) {
    next(err);
  }
}
