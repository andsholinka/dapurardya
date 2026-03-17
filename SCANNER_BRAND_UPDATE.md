# Scanner Feature - Brand Color Update

## Summary

Fitur Scanner Kulkas AI telah diperbarui untuk mengikuti standar warna brand Dapur Ardya yang baru.

## Perubahan Warna

### Sebelum (Purple/Pink/Magenta)
- Purple: `#9333EA`, `#A855F7`, `#C084FC`
- Pink: `#EC4899`, `#F472B6`
- Magenta gradients

### Sesudah (Brand Colors)
- Primary (Sky Blue): `#99CDD8`
- Secondary (Mint Cream): `#DAEEDC`
- Accent (Salmon Pink): `#F3C1B2`
- Sage Green: `#C8E6C7`

## Komponen yang Diupdate

### 1. Scanner Page (`src/app/kulkas/scanner/page.tsx`)
- ✅ Header badge: Purple → Primary
- ✅ Title gradient: Purple-Pink → Primary-Accent
- ✅ Camera button: Purple gradient → Primary gradient
- ✅ Scan button: Purple-Pink → Primary-Accent
- ✅ Alert box: Purple → Primary
- ✅ Loading spinner: Purple → Primary
- ✅ Detected ingredients badges: Purple-Pink → Secondary-Accent
- ✅ Recipe match badges: Purple-Pink → Primary-Accent
- ✅ Recipe reason box: Purple → Secondary
- ✅ Chat button border: Purple → Primary
- ✅ Chat header: Purple-Pink → Primary-Accent
- ✅ Chat messages: Purple-Pink → Primary-Accent
- ✅ Chat input focus: Purple → Primary
- ✅ Chat send button: Purple-Pink → Primary-Accent
- ✅ Empty state border: Purple → Primary

### 2. Kulkas Page (`src/app/kulkas/page.tsx`)
- ✅ Scanner CTA button: Purple-Pink → Primary-Accent

### 3. Scanner Guide (`src/components/ScannerGuide.tsx`)
- ✅ Background gradient: Purple-Pink → Secondary-Accent
- ✅ Icon background: Purple → Primary
- ✅ Border: Purple → Primary

## Konsistensi Brand

Semua elemen AI Scanner sekarang menggunakan:
- **Primary actions**: Sky Blue (#99CDD8)
- **Gradients**: Sky Blue → Salmon Pink
- **Backgrounds**: Mint Cream & Peach tones
- **Borders**: Primary dengan opacity

## Testing

Untuk melihat perubahan:
```bash
npm run dev
```

Navigasi ke:
- `/kulkas` - Halaman input bahan
- `/kulkas/scanner` - Halaman scanner AI

Perhatikan:
- Semua button dan badge menggunakan warna brand baru
- Gradient lebih soft dan natural
- Konsisten dengan warna di seluruh aplikasi
