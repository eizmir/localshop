import { Document, model, Schema, Types } from 'mongoose';

export interface PaymentDoc extends Document {
  orderId: Types.ObjectId;
  status: 'SUCCESS' | 'FAILED';
  transactionId: string;
  createdAt: Date;
}

const paymentSchema = new Schema<PaymentDoc>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    status: { type: String, enum: ['SUCCESS', 'FAILED'], required: true },
    transactionId: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const Payment = model<PaymentDoc>('Payment', paymentSchema);
