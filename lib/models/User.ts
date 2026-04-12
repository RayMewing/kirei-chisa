import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  password: string;
  isVerified: boolean;
  isAdmin: boolean;
  premkuBalance: number;
  nokosBalance: number;
  otpCode: string | null;
  otpExpiry: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 20 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    isVerified: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    premkuBalance: { type: Number, default: 0, min: 0 },
    nokosBalance: { type: Number, default: 0, min: 0 },
    otpCode: { type: String, default: null },
    otpExpiry: { type: Date, default: null },
  },
  { timestamps: true }
);

const User = models.User || model<IUser>('User', UserSchema);
export default User;
