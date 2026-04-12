import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IBanner extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
}

const BannerSchema = new Schema<IBanner>(
  {
    title: { type: String, required: true },
    imageUrl: { type: String, required: true },
    linkUrl: { type: String, default: '#' },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Banner = models.Banner || model<IBanner>('Banner', BannerSchema);
export default Banner;
