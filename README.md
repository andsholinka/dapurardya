# Dapur Ardya

Website kumpulan resep masakan – tampilan girly, nyaman di HP, siap PWA. Dibangun dengan Next.js, Tailwind, shadcn/ui, dan MongoDB.

## Fitur

- **Publik:** Semua resep, cari resep, halaman detail resep
- **Admin:** Login di `/login`, kelola resep (tambah, edit, hapus) di `/admin`
- **PWA:** Manifest disediakan; tambah icon 192x192 dan 512x512 di `public/` sebagai `icon-192.png` dan `icon-512.png` untuk install ke HP

## Setup

### 1. Install dependensi

```bash
npm install
```

### 2. Environment

Salin `.env.example` ke `.env.local` dan isi:

- **MONGODB_URI** – connection string MongoDB (wajib agar resep tersimpan)
- **MONGODB_DB_NAME** – nama database (default: `dapurardya`)
- **ADMIN_PASSWORD_HASH** – hash bcrypt password admin

Generate hash password:

```bash
node scripts/hash-password.js "password-anda"
```

Salin output ke `.env.local` sebagai `ADMIN_PASSWORD_HASH=...`

### 3. Jalankan

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000). Admin: [http://localhost:3000/login](http://localhost:3000/login).

## Build production

```bash
npm run build
npm start
```

## PWA

- `public/manifest.json` sudah disiapkan.
- Tambahkan `public/icon-192.png` dan `public/icon-512.png` untuk ikon install di perangkat.
- Theme color dan background color sudah diset nuansa pink/rose.

## Tech stack

- Next.js (App Router), React, TypeScript
- Tailwind CSS v4, shadcn/ui
- MongoDB
