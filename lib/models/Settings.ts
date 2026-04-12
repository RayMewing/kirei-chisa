import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface ISettings extends Document {
  key: string;
  value: string | number | boolean | object;
}

const SettingsSchema = new Schema<ISettings>(
  {
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

const Settings = models.Settings || model<ISettings>('Settings', SettingsSchema);
export default Settings;
