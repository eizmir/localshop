import { NextFunction, Request, Response } from 'express';
import * as orderService from '../services/orderService';

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json(await orderService.createOrder(req.user!.id));
  } catch (err) {
    next(err);
  }
}

export async function listMine(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await orderService.listMyOrders(req.user!.id));
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await orderService.getOrder(String(req.params.id), req.user!.id));
  } catch (err) {
    next(err);
  }
}

export async function listForSeller(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await orderService.listSellerOrders(req.user!.id));
  } catch (err) {
    next(err);
  }
}
