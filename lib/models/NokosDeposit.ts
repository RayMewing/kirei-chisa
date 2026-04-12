import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface INokosDeposit extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  depositId: string;
  amount: number;
  fee: number;
  diterima: number;
  paymentId: string;
  qrString: string;
  qrImage: string;
  status: 'pending' | 'success' | 'cancel';
  expiredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NokosDepositSchema = new Schema<INokosDeposit>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    depositId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    fee: { type: Number, required: true },
    diterima: { type: Number, required: true },
    paymentId: { type: String, default: 'qris' },
    qrString: { type: String, default: '' },
    qrImage: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'success', 'cancel'], default: 'pending' },
    expiredAt: { type: Date, required: true },
  },
  { timestamps: true }
);

const NokosDeposit = models.NokosDeposit || model<INokosDeposit>('NokosDeposit', NokosDepositSchema);
export default NokosDeposit;
