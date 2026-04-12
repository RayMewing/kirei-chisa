import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IPremkuOrder extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  invoice: string;
  refId: string;
  productId: number;
  productName: string;
  qty: number;
  price: number;
  total: number;
  status: 'pending' | 'success' | 'failed' | 'processing';
  accounts: Array<{ username: string; password: string }>;
  createdAt: Date;
  updatedAt: Date;
}

const PremkuOrderSchema = new Schema<IPremkuOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    invoice: { type: String, required: true, unique: true },
    refId: { type: String, required: true, unique: true },
    productId: { type: Number, required: true },
    productName: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    total: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'success', 'failed', 'processing'], default: 'pending' },
    accounts: [{ username: String, password: String }],
  },
  { timestamps: true }
);

const PremkuOrder = models.PremkuOrder || model<IPremkuOrder>('PremkuOrder', PremkuOrderSchema);
export default PremkuOrder;
