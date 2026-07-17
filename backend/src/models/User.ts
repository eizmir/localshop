import bcrypt from 'bcryptjs';
import { Document, model, Schema } from 'mongoose';
import type { Role } from '../types/auth';

export interface UserDoc extends Document {
  name: string;
  email: string;
  password: string;
  role: Role;
  phone?: string;
  address?: string;
  createdAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<UserDoc>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['customer', 'seller'], required: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

userSchema.pre('save', async function () {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
});

userSchema.methods.comparePassword = function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export const User = model<UserDoc>('User', userSchema);
