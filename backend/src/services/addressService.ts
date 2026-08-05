import { Types } from 'mongoose';
import { msg } from '../i18n';
import { ApiError } from '../middleware/errorHandler';
import { AddressDoc, User, UserDoc } from '../models/User';
import type { CreateAddressInput } from '../validators/address';

export function toPublicAddress(address: AddressDoc) {
  return { id: String(address._id), title: address.title, text: address.text };
}

async function requireUser(userId: string): Promise<UserDoc> {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, msg.userNotFound);
  return user;
}

export async function listAddresses(userId: string) {
  const user = await requireUser(userId);
  return user.addresses.map(toPublicAddress);
}

export async function addAddress(userId: string, input: CreateAddressInput) {
  const user = await requireUser(userId);
  const created = user.addresses.create(input);
  user.addresses.push(created);
  await user.save();
  return toPublicAddress(created);
}

export async function removeAddress(userId: string, addressId: string) {
  if (!Types.ObjectId.isValid(addressId)) throw new ApiError(404, msg.addressNotFound);
  const user = await requireUser(userId);
  const address = user.addresses.id(addressId);
  if (!address) throw new ApiError(404, msg.addressNotFound);
  address.deleteOne();
  await user.save();
  return user.addresses.map(toPublicAddress);
}

export async function findAddress(user: UserDoc, addressId: string) {
  if (!Types.ObjectId.isValid(addressId)) throw new ApiError(404, msg.addressNotFound);
  const address = user.addresses.id(addressId);
  if (!address) throw new ApiError(404, msg.addressNotFound);
  return address;
}
