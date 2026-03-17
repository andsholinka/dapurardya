# 📸 AI-Powered Recipe & Nutrition Scanner

> Foto kulkas, dapat resep + kalori! Powered by Google Gemini AI.

## ✨ Fitur Utama

🔍 **Image Recognition** - Deteksi bahan makanan dari foto  
🍳 **Smart Recipe Matching** - Saran resep dari database Dapur Ardya  
🔥 **Nutrition Info** - Estimasi kalori & makronutrien  
💬 **Chat dengan Chef AI** - Panduan memasak step-by-step  
📱 **Mobile-First** - Responsive untuk iOS & Android  

## 🎯 User Flow

```
1. Foto/Upload → 2. AI Scan → 3. Deteksi Bahan → 4. Saran Resep → 5. Chat AI
```

## 💳 Credit System

- **Scan**: 2 Credit per scan
- **Chat**: 1 Credit per sesi (unlimited messages)
- **Member Baru**: 5 Credit gratis
- **Admin**: Unlimited

## 🚀 Quick Start

```bash
# 1. Setup environment
echo "GEMINI_API_KEY=your_key" >> .env.local

# 2. Run dev server
npm run dev

# 3. Open browser
open http://localhost:3000/kulkas/scanner
```

## 📱 Screenshots

### Scanner Interface
- Camera/Upload options
- Real-time preview
- Loading animations

### Results Display
- Detected ingredients with confidence
- Recipe cards with match scores
- Nutrition badges (calories, macros)

### Chat Feature
- Interactive modal
- Conversational AI
- Step-by-step guidance

## 🏗️ Tech Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS
- **AI**: Google Gemini 2.0 Flash (Vision) + 2.5 Flash (Text)
- **Backend**: Next.js API Routes, MongoDB
- **Auth**: Custom JWT-based member system

## 📊 Performance

- **Scan Time**: 15-30 seconds
- **Chat Response**: 5-10 seconds
- **Page Load**: < 3 seconds
- **Mobile Optimized**: 60 FPS animations

## 🔐 Security

- Member-only access
- Credit validation
- Rate limiting
- Input sanitization
- Secure image handling

## 📚 Documentation

- [Full Feature Docs](./AI_SCANNER_FEATURE.md)
- [Testing Guide](./TESTING_SCANNER.md)
- [Quick Start](./QUICKSTART_SCANNER.md)

## 🐛 Known Issues

- iOS Safari camera requires HTTPS
- Large images (>5MB) may timeout
- Gemini API rate limits apply

## 🎨 Customization

### Change Colors
```tsx
// Purple-pink gradient → Your brand colors
className="bg-gradient-to-r from-purple-600 to-pink-600"
```

### Adjust Credits
```typescript
const SCAN_CREDIT_COST = 2; // Change in route.ts
```

### Modify Prompts
```typescript
// Edit prompts in src/lib/gemini-vision.ts
```

## 🤝 Contributing

1. Test on real devices
2. Report bugs with screenshots
3. Suggest improvements
4. Add more recipes to database

## 📞 Support

- Check docs first
- Test with clear photos
- Ensure good lighting
- Contact support if issues persist

## 📄 License

Part of Dapur Ardya App - All rights reserved

---

**Built with ❤️ for food lovers**  
**Powered by Google Gemini AI**
