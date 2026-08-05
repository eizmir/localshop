import { NextFunction, Request, Response } from 'express';
import * as addressService from '../services/addressService';

export async function listMine(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await addressService.listAddresses(req.user!.id));
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json(await addressService.addAddress(req.user!.id, req.body));
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await addressService.removeAddress(req.user!.id, String(req.params.id)));
  } catch (err) {
    next(err);
  }
}
