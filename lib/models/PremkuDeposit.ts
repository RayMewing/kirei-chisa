import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IPremkuDeposit extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  invoice: string;
  amount: number;
  totalBayar: number;
  kodeUnik: number;
  qrImage: string;
  qrRaw: string;
  status: 'pending' | 'success' | 'canceled' | 'expired' | 'confirmed';
  confirmedByAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PremkuDepositSchema = new Schema<IPremkuDeposit>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    invoice: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    totalBayar: { type: Number, required: true },
    kodeUnik: { type: Number, required: true },
    qrImage: { type: String, default: '' },
    qrRaw: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'success', 'canceled', 'expired', 'confirmed'],
      default: 'pending',
    },
    confirmedByAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const PremkuDeposit = models.PremkuDeposit || model<IPremkuDeposit>('PremkuDeposit', PremkuDepositSchema);
export default PremkuDeposit;
