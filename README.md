# Kirei Chisa 🎌
> Platform jual beli akun premium (Premku) & OTP virtual (Nokos)

---

## 🚀 Setup & Deploy ke Vercel

### 1. Clone & Install
```bash
git clone <your-repo>
cd kirei-chisa
npm install
```

### 2. Buat file `.env.local` dari `.env.example`
```bash
cp .env.example .env.local
```

Isi semua variable berikut:

| Variable | Keterangan |
|---|---|
| `MONGODB_URI` | URI MongoDB Atlas (ganti `<db_password>`) |
| `JWT_SECRET` | String random panjang untuk signing JWT user |
| `JWT_ADMIN_SECRET` | String random panjang untuk signing JWT admin |
| `SMTP_HOST` | Host SMTP (default: smtp.gmail.com) |
| `SMTP_PORT` | Port SMTP (default: 587) |
| `SMTP_USER` | Email Gmail kamu |
| `SMTP_PASS` | App Password Gmail (bukan password biasa) |
| `SMTP_FROM` | Nama & email pengirim |
| `ADMIN_EMAIL` | Email admin untuk login dashboard |
| `PREMKU_API_KEY` | API Key dari premku.com |
| `RUMAHOTP_API_KEY` | API Key dari rumahotp.io |
| `NEXT_PUBLIC_APP_URL` | URL website kamu di Vercel |

### 3. Buat akun admin pertama
```bash
# Set env dulu, lalu jalankan:
MONGODB_URI="..." ADMIN_EMAIL="admin@kamu.com" ADMIN_PASSWORD="password123" \
  npx ts-node --skipProject scripts/seed-admin.ts
```

Atau langsung tambah via MongoDB Compass / Atlas UI dengan field:
```json
{
  "username": "admin",
  "email": "admin@kireichisa.com",
  "password": "<bcrypt hash of password>",
  "isVerified": true,
  "isAdmin": true,
  "premkuBalance": 0,
  "nokosBalance": 0
}
```

### 4. Deploy ke Vercel
```bash
npm i -g vercel
vercel --prod
```

Atau push ke GitHub → connect di vercel.com → set Environment Variables di dashboard Vercel.

---

## 📁 Struktur Project

```
kirei-chisa/
├── app/
│   ├── api/                  # All API routes
│   │   ├── auth/             # Login, register, OTP, admin login
│   │   ├── user/             # Profile, history, active orders
│   │   ├── premku/           # Products, order, deposit
│   │   ├── nokos/            # Services, countries, operators, order, deposit
│   │   ├── admin/            # Stats, users, transactions, banners, settings
│   │   ├── banners/          # Public banners
│   │   └── settings/         # Public settings (socials, FAQ)
│   ├── (pages)/
│   │   ├── page.tsx          # Homepage
│   │   ├── premku/           # Premku products page
│   │   ├── nokos/            # Nokos OTP page
│   │   ├── dashboard/        # User dashboard
│   │   ├── deposit/          # Deposit page
│   │   ├── history/          # History page
│   │   ├── login/            # Login page
│   │   ├── register/         # Register page (+ OTP)
│   │   └── admin/            # Admin dashboard
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── BannerSlider.tsx
│   ├── ServerStatus.tsx
│   └── CountdownTimer.tsx
├── lib/
│   ├── mongodb.ts            # DB connection
│   ├── auth.ts               # JWT utilities
│   ├── mailer.ts             # Nodemailer OTP
│   ├── utils.ts              # Helpers
│   ├── adminAuth.ts          # Admin auth helper
│   └── models/               # Mongoose models
│       ├── User.ts
│       ├── PremkuOrder.ts
│       ├── NokosOrder.ts
│       ├── PremkuDeposit.ts
│       ├── NokosDeposit.ts
│       ├── Banner.ts
│       └── Settings.ts
└── middleware.ts             # Route protection
```

---

## ✨ Fitur

### User
- ✅ Register + verifikasi OTP via email
- ✅ Login (JWT httpOnly cookie)
- ✅ Saldo terpisah: Premku & Nokos
- ✅ Deposit via QRIS (Premku & Nokos)
- ✅ Beli akun premium Premku (dengan kategori)
- ✅ Beli OTP Nokos (pilih app → negara → operator)
- ✅ Auto-refund Nokos setelah 20 menit jika OTP tidak masuk
- ✅ Cancel Nokos setelah 3 menit + saldo refund
- ✅ Dashboard dengan pesanan aktif & saldo
- ✅ Riwayat lengkap (order & deposit) dengan cek status & cancel
- ✅ Banner slider 16:9 di homepage
- ✅ Server status (ping latency)
- ✅ Maintenance Nokos otomatis 23:20–00:25 WIB
- ✅ FAQ & social media links di footer

### Admin
- ✅ Login admin dengan OTP ke email
- ✅ Dashboard statistik (user, order, revenue)
- ✅ Kelola user (lihat & edit saldo manual)
- ✅ Monitor semua transaksi (deposit & order)
- ✅ Konfirmasi deposit delay manual
- ✅ CRUD banner promosi (toggle aktif/nonaktif)
- ✅ Pengaturan link sosmed (Telegram, TikTok, WA, WA Channel)
- ✅ Pengaturan FAQ
- ✅ Edit profil admin (username & password)

---

## 🔒 Keamanan
- JWT disimpan di httpOnly cookie (tidak bisa diakses JS)
- Password di-hash dengan bcrypt (12 rounds)
- Admin login wajib OTP ke email
- Route protection via Next.js middleware
- API key tidak pernah dikirim ke client
