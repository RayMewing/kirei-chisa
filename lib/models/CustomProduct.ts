import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface ICustomProductAccount {
  email: string;
  password: string;
  notes: string;
  sold: boolean;
}

export interface ICustomProduct extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  imageBase64: string;
  price: number;
  category: string;
  isActive: boolean;
  accounts: ICustomProductAccount[];
  createdAt: Date;
  updatedAt: Date;
}

const AccountSchema = new Schema<ICustomProductAccount>({
  email: { type: String, required: true },
  password: { type: String, required: true },
  notes: { type: String, default: '' },
  sold: { type: Boolean, default: false },
});

const CustomProductSchema = new Schema<ICustomProduct>(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    imageBase64: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, default: 'Lainnya' },
    isActive: { type: Boolean, default: true },
    accounts: [AccountSchema],
  },
  { timestamps: true }
);

const CustomProduct = models.CustomProduct || model<ICustomProduct>('CustomProduct', CustomProductSchema);
export default CustomProduct;
