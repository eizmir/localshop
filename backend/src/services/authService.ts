import { msg } from '../i18n';
import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { ApiError } from '../middleware/errorHandler';
import { User, UserDoc } from '../models/User';
import type { LoginInput, RegisterInput } from '../validators/auth';

export function toPublicUser(user: UserDoc) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    address: user.address,
    createdAt: user.createdAt,
  };
}

function signToken(user: UserDoc): string {
  return jwt.sign({ id: String(user._id), role: user.role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as SignOptions);
}

export async function register(input: RegisterInput) {
  const existing = await User.findOne({ email: input.email });
  if (existing) throw new ApiError(409, msg.emailTaken);
  const user = await User.create(input);
  return { token: signToken(user), user: toPublicUser(user) };
}

export async function login(input: LoginInput) {
  const user = await User.findOne({ email: input.email }).select('+password');
  if (!user || !(await user.comparePassword(input.password))) {
    throw new ApiError(401, msg.invalidCredentials);
  }
  return { token: signToken(user), user: toPublicUser(user) };
}

export async function getMe(userId: string) {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, msg.userNotFound);
  return toPublicUser(user);
}
