import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface INokosOrder extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  orderId: string;
  serviceCode: number;
  serviceName: string;
  serviceImg: string;
  countryName: string;
  countryFlag: string;
  operatorName: string;
  numberId: number;
  providerId: string;
  operatorId: number;
  phoneNumber: string;
  price: number;
  status: 'active' | 'completed' | 'canceled' | 'expired' | 'refunded';
  otpCode: string | null;
  otpMsg: string | null;
  expiresAt: Date;
  refundAt: Date; // 20 minutes from creation
  cancelAllowedAt: Date; // 3 minutes from creation
  createdAt: Date;
  updatedAt: Date;
}

const NokosOrderSchema = new Schema<INokosOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    orderId: { type: String, required: true, unique: true },
    serviceCode: { type: Number, required: true },
    serviceName: { type: String, required: true },
    serviceImg: { type: String, default: '' },
    countryName: { type: String, required: true },
    countryFlag: { type: String, default: '' },
    operatorName: { type: String, required: true },
    numberId: { type: Number, required: true },
    providerId: { type: String, required: true },
    operatorId: { type: Number, required: true },
    phoneNumber: { type: String, required: true },
    price: { type: Number, required: true },
    status: {
      type: String,
      enum: ['active', 'completed', 'canceled', 'expired', 'refunded'],
      default: 'active',
    },
    otpCode: { type: String, default: null },
    otpMsg: { type: String, default: null },
    expiresAt: { type: Date, required: true },
    refundAt: { type: Date, required: true },
    cancelAllowedAt: { type: Date, required: true },
  },
  { timestamps: true }
);

const NokosOrder = models.NokosOrder || model<INokosOrder>('NokosOrder', NokosOrderSchema);
export default NokosOrder;
