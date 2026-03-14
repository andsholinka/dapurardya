# 🍳 Dapur Ardya

**Dapur Ardya** adalah platform resep masakan modern yang dirancang khusus untuk kenyamanan memasak di rumah. Dengan desain yang *girly*, hangat, dan premium, aplikasi ini memberikan pengalaman pengguna yang sangat halus (*smooth*) terutama pada perangkat mobile.

---

## ✨ Fitur Utama

### 1. Eksplorasi & Publik
- **Koleksi Resep Premium**: Berbagai resep dengan foto menarik, instruksi detail (bahan, langkah, waktu persiapan/masak, dan porsi).
- **Omnisearch**: Pencarian cepat resep berdasarkan nama atau kategori.
- **Related Recipes**: Rekomendasi resep serupa untuk inspirasi harian.
- **Smart Sharing**: Berbagi resep favorit ke media sosial dengan tombol bagikan yang cerdas.

### 2. Member Area (Fitur Premium)
- **Review & Photo Reviews**: Member dapat memberikan rating bintang, komentar, dan **mengunggah foto hasil masakan mereka**.
- **Personalized Bookmark**: Simpan resep favorit ke koleksi pribadi ("Simpan Resep").
- **Recipe Request**: Fitur khusus bagi member untuk meminta resep tertentu kepada admin.
- **Member Dashboard**: Pantau histori request dan kelola aktivitas member.

### 3. Cook Mode (Fokus Mode) 🚀
*Fitur unggulan untuk pengalaman memasak tanpa gangguan di dapur:*
- **Interface Full-Screen**: Teks instruksi raksasa agar mudah dibaca dari kejauhan (tanpa perlu memegang HP).
- **Anti-Sleep (Wake Lock API)**: Layar HP akan **tetap menyala** (tidak akan terkunci otomatis) selama Anda berada dalam Mode Memasak.
- **Integrated Smart Timer**: Timer otomatis aktif jika sistem mendeteksi instruksi waktu pada langkah memasak, lengkap dengan **notifikasi suara (audio alert)** saat durasi selesai.
- **Progress Tracking**: Navigasi per-langkah dengan bar progres yang jelas.

### 4. Admin Dashboard
- **Analytics Management**: Memantau statistik dasar resep.
- **Recipe Management**: CRUD lengkap (Create, Read, Update, Delete) resep dengan integrasi Cloudinary untuk foto.
- **Member Request Management**: Menanggapi dan memproses permintaan resep dari member.

### 5. PWA (Progressive Web App)
- **Installable**: Dapat diinstal di HP (Android/iOS) atau Desktop layaknya aplikasi native.
- **Mobile First**: Navigasi yang jempol-friendly dan performa tinggi.

---

## 🛠 Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Frontend**: React 19, Tailwind CSS v4, shadcn/ui
- **Icons**: Lucide React
- **Database**: MongoDB (via MongoDB Driver)
- **Authentication**: Custom Authentication with `bcryptjs` & `getMemberSession`
- **Media**: Cloudinary API (Image Hosting)
- **Browser API**: Screen Wake Lock API (for Cook Mode)

---

## 🚀 Cara Menjalankan

### 1. Kloning & Install Dependensi
```bash
npm install
```

### 2. Konfigurasi Environment
Salin `.env.example` ke `.env.local` dan lengkapi variabel berikut:
- `MONGODB_URI`: String koneksi MongoDB.
- `ADMIN_PASSWORD_HASH`: Hash password untuk admin (Gunakan script hash-password).
- `CLOUDINARY_URL`: API Cloudinary untuk upload gambar.

### 3. Generate Admin Password
```bash
node scripts/hash-password.js "password_pilihan_anda"
```

### 4. Jalankan Development
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000).

---

## 📸 Media & Aset
Aset gambar disimpan di Cloudinary. Pastikan API key sudah terkonfigurasi untuk fitur upload foto review dan manajemen resep.

---

**Dapur Ardya** – *Temani setiap langkah masakanmu dengan kasih sayang.* ✨
