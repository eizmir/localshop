import bcrypt from 'bcryptjs';
import { Document, model, Schema, Types } from 'mongoose';
import type { Role } from '../types/auth';

export interface AddressDoc extends Types.Subdocument {
  title: string;
  text: string;
}

export interface UserDoc extends Document {
  name: string;
  email: string;
  password: string;
  role: Role;
  phone: string;
  addresses: Types.DocumentArray<AddressDoc>;
  createdAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const addressSchema = new Schema<AddressDoc>({
  title: { type: String, required: true, trim: true, maxlength: 60 },
  text: { type: String, required: true, trim: true, maxlength: 300 },
});

const userSchema = new Schema<UserDoc>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['customer', 'seller'], required: true },
    phone: { type: String, required: true, trim: true },
    addresses: { type: [addressSchema], default: [] },
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
