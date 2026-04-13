import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IPpobOrder extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  transaksiId: string;
  productCode: string;
  productName: string;
  productNote: string;
  productType: string;
  productBrand: string;
  productCategory: string;
  target: string;
  targetName: string | null;
  price: number;
  status: 'processing' | 'success' | 'failed' | 'canceled' | 'pending';
  refund: boolean;
  sn: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const PpobOrderSchema = new Schema<IPpobOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    transaksiId: { type: String, required: true, unique: true },
    productCode: { type: String, required: true },
    productName: { type: String, required: true },
    productNote: { type: String, default: '' },
    productType: { type: String, default: '' },
    productBrand: { type: String, default: '' },
    productCategory: { type: String, default: '' },
    target: { type: String, required: true },
    targetName: { type: String, default: null },
    price: { type: Number, required: true },
    status: {
      type: String,
      enum: ['processing', 'success', 'failed', 'canceled', 'pending'],
      default: 'processing',
    },
    refund: { type: Boolean, default: false },
    sn: { type: String, default: null },
  },
  { timestamps: true }
);

const PpobOrder = models.PpobOrder || model<IPpobOrder>('PpobOrder', PpobOrderSchema);
export default PpobOrder;
