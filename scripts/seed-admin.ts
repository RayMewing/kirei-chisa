// scripts/seed-admin.ts
// Run: npx ts-node --project tsconfig.json scripts/seed-admin.ts
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://...';

async function main() {
  await mongoose.connect(MONGODB_URI);

  const UserSchema = new mongoose.Schema({
    username: String, email: String, password: String,
    isVerified: Boolean, isAdmin: Boolean,
    premkuBalance: { type: Number, default: 0 },
    nokosBalance: { type: Number, default: 0 },
    otpCode: String, otpExpiry: Date,
  }, { timestamps: true });

  const User = mongoose.models.User || mongoose.model('User', UserSchema);

  const email = process.env.ADMIN_EMAIL || 'admin@kireichisa.com';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const existing = await User.findOne({ email });

  if (existing) {
    console.log('Admin already exists:', email);
    process.exit(0);
  }

  const hashed = await bcrypt.hash(password, 12);
  await User.create({ username: 'admin', email, password: hashed, isVerified: true, isAdmin: true });
  console.log('✅ Admin created:', email, '/ password:', password);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
