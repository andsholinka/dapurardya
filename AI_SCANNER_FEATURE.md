# AI-Powered Recipe & Nutrition Scanner

## 📸 Overview

Fitur AI Scanner memungkinkan user untuk memotret isi kulkas atau bahan makanan yang berantakan, dan Gemini AI akan:
- Mendeteksi bahan-bahan yang ada di foto
- Menyarankan resep yang bisa dibuat
- Memberikan estimasi kalori dan informasi nutrisi
- Menyediakan chat interaktif dengan Chef AI untuk panduan memasak step-by-step

## 🎯 Fitur Utama

### 1. Image Recognition (Gemini Vision)
- Scan foto kulkas/bahan makanan
- Deteksi otomatis bahan dengan confidence score
- Support foto dari kamera atau upload
- Responsive untuk Android & iOS

### 2. Recipe Matching dengan Nutrisi
- Matching bahan terdeteksi dengan database resep Dapur Ardya
- Skor kecocokan (match score) untuk setiap resep
- Estimasi kalori per porsi
- Informasi makronutrien (Protein, Karbohidrat, Lemak)

### 3. Chat dengan Chef AI
- Panduan memasak step-by-step
- Tanya jawab interaktif tentang resep
- Tips dan trik memasak
- Context-aware conversation

## 🏗️ Struktur File

```
src/
├── app/
│   ├── kulkas/
│   │   ├── page.tsx                    # Halaman input manual (existing)
│   │   └── scanner/
│   │       └── page.tsx                # Halaman AI Scanner (NEW)
│   └── api/
│       └── ai/
│           ├── scan-ingredients/
│           │   └── route.ts            # API endpoint untuk scan foto (NEW)
│           └── chat-recipe/
│               └── route.ts            # API endpoint untuk chat AI (NEW)
└── lib/
    ├── gemini.ts                       # Gemini text AI (existing)
    └── gemini-vision.ts                # Gemini Vision AI (NEW)
```

## 🔧 Teknologi yang Digunakan

### Frontend
- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **MediaDevices API** - Akses kamera

### Backend
- **Gemini 2.5 Flash Image** - Vision AI untuk deteksi bahan (support image input)
- **Gemini 2.5 Flash** - Text AI untuk chat dan nutrisi
- **MongoDB** - Database resep dan member
- **Next.js API Routes** - Backend endpoints

## 📱 Responsive Design

### Mobile-First Approach
- Touch-friendly UI dengan button besar
- Camera API untuk foto langsung
- Upload foto dari galeri
- Chat modal full-screen di mobile
- Smooth animations dan transitions

### Desktop Experience
- Grid layout untuk hasil resep
- Modal chat dengan ukuran optimal
- Hover effects dan interactions

## 💳 Credit System

### Biaya Penggunaan
- **AI Scanner**: 2 Credit per scan
- **Chat dengan Chef AI**: 1 Credit per sesi (unlimited messages dalam sesi)

### Member Benefits
- Member baru: 5 Credit gratis
- Admin: Unlimited untuk semua fitur AI
- Credit tidak pernah hangus
- Bisa top-up kapan saja

## 🚀 Cara Penggunaan

### 1. Akses Fitur Scanner
```
/kulkas/scanner
```

### 2. Ambil/Upload Foto
- Klik "Buka Kamera" untuk foto langsung
- Klik "Upload Foto" untuk pilih dari galeri
- Pastikan foto jelas dan bahan terlihat

### 3. Scan & Analisis
- Klik "Scan & Analisis Bahan"
- AI akan mendeteksi bahan (15-30 detik)
- Hasil: List bahan + confidence score

### 4. Lihat Rekomendasi Resep
- Resep dengan match score tertinggi
- Estimasi kalori dan nutrisi
- Alasan kenapa resep cocok

### 5. Chat dengan Chef AI
- Klik "Chat dengan Chef AI" pada resep
- Tanya panduan memasak
- Dapatkan tips dan trik

## 🔐 Authentication & Authorization

### Member-Only Feature
```typescript
// Check member session
const session = await verifyMemberSession(req);
if (!session) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

### Credit Check
```typescript
// Check sufficient credits
const credits = member.credits ?? 0;
const isAdmin = session.role === "admin";

if (!isAdmin && credits < SCAN_CREDIT_COST) {
  return NextResponse.json({ error: "Credit tidak cukup" }, { status: 403 });
}
```

## 🧪 Testing

### Manual Testing Checklist

#### Camera Functionality
- [ ] Kamera terbuka di mobile (iOS & Android)
- [ ] Kamera terbuka di desktop
- [ ] Capture foto berhasil
- [ ] Stop kamera berfungsi

#### Upload Functionality
- [ ] Upload dari galeri berhasil
- [ ] Preview foto tampil
- [ ] Hapus foto berfungsi

#### AI Scanning
- [ ] Deteksi bahan akurat (>80% confidence)
- [ ] Handling foto blur/gelap
- [ ] Timeout handling (30 detik)
- [ ] Error handling

#### Recipe Suggestions
- [ ] Match score akurat
- [ ] Kalori estimasi reasonable
- [ ] Nutrisi info lengkap
- [ ] Link ke detail resep

#### Chat Feature
- [ ] Chat modal terbuka
- [ ] Kirim pesan berhasil
- [ ] AI reply relevant
- [ ] Chat history tersimpan
- [ ] Close modal berfungsi

#### Credit System
- [ ] Credit terpotong setelah scan (2 credits)
- [ ] Credit terpotong untuk chat session (1 credit)
- [ ] Admin unlimited (tidak dipotong)
- [ ] Error jika credit habis
- [ ] Redirect ke upgrade page

## 🎨 UI/UX Highlights

### Visual Design
- Gradient purple-pink untuk AI features
- Smooth animations (fade-in, slide-in)
- Loading states dengan spinner
- Confidence badges untuk bahan
- Match score badges untuk resep
- Calorie badges dengan flame icon

### User Flow
1. Landing → Pilih camera/upload
2. Capture/Select → Preview foto
3. Scan → Loading animation
4. Results → Bahan + Resep
5. Chat → Interactive guidance

### Accessibility
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Touch-friendly (min 44px tap targets)
- High contrast colors

## 🔮 Future Enhancements

### Phase 2
- [ ] Batch scanning (multiple photos)
- [ ] Save scan history
- [ ] Share results ke social media
- [ ] Barcode scanning untuk packaged food
- [ ] Voice input untuk chat

### Phase 3
- [ ] Meal planning dari scan results
- [ ] Shopping list generation
- [ ] Nutrition tracking over time
- [ ] Recipe customization based on dietary restrictions
- [ ] AR overlay untuk cooking guidance

## 📊 Performance Optimization

### Image Handling
- Compress foto sebelum upload (max 2MB)
- Convert ke JPEG dengan quality 0.8
- Resize ke max 1920x1080

### API Optimization
- Timeout 30 detik untuk vision
- Retry mechanism (max 2 retries)
- Caching untuk frequent ingredients
- Rate limiting per member

### Frontend Optimization
- Lazy load chat modal
- Debounce chat input
- Optimize re-renders dengan useMemo
- Image optimization dengan Next.js Image

## 🐛 Known Issues & Solutions

### Issue 1: Camera tidak terbuka di iOS Safari
**Solution**: Gunakan `playsinline` attribute pada video element

### Issue 2: Base64 image terlalu besar
**Solution**: Compress dan resize sebelum kirim ke API

### Issue 3: Gemini Vision timeout
**Solution**: Retry mechanism + fallback ke text-based matching

### Issue 4: Chat context terlalu panjang
**Solution**: Limit history ke 10 messages terakhir

## 📝 Environment Variables

```env
# Required
GEMINI_API_KEY=your_gemini_api_key

# Optional (defaults provided)
GEMINI_MODEL=gemini-2.5-flash
GEMINI_VISION_MODEL=gemini-2.5-flash-image
```

## 🎓 Best Practices

### For Developers
1. Always validate image format dan size
2. Handle timeout gracefully
3. Provide clear error messages
4. Log AI responses untuk debugging
5. Test di berbagai devices

### For Users
1. Foto dengan pencahayaan baik
2. Bahan terlihat jelas (tidak blur)
3. Hindari foto terlalu ramai
4. Gunakan background kontras
5. Foto dari angle yang baik

## 📞 Support

Jika ada masalah dengan fitur AI Scanner:
1. Check credit balance
2. Pastikan foto jelas
3. Coba foto ulang dengan pencahayaan lebih baik
4. Contact support jika masalah berlanjut

---

**Built with ❤️ by Dapur Ardya Team**
**Powered by Google Gemini AI**
