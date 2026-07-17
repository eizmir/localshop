import { msg } from '../i18n';
import { NextFunction, Request, Response } from 'express';
import * as productService from '../services/productService';
import { listProductsQuerySchema } from '../validators/product';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listProductsQuerySchema.safeParse(req.query);
    if (!query.success) {
      res.status(400).json({ message: msg.invalidQuery });
      return;
    }
    res.json(await productService.listProducts(query.data));
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await productService.getProduct(String(req.params.id)));
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json(await productService.createProduct(req.user!.id, req.body));
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await productService.updateProduct(String(req.params.id), req.user!.id, req.body));
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await productService.deleteProduct(String(req.params.id), req.user!.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export async function mine(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await productService.listSellerProducts(req.user!.id));
  } catch (err) {
    next(err);
  }
}
