# Quick Start Guide - AI Scanner Feature

## 🚀 Setup (5 minutes)

### 1. Environment Variables
```bash
# Add to .env.local
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

### 2. Install Dependencies
```bash
npm install
# Dependencies already in package.json:
# - @google/generative-ai
# - next, react, typescript, etc.
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Access the Feature
```
http://localhost:3000/kulkas/scanner
```

## 📁 File Structure

```
src/
├── app/
│   ├── kulkas/scanner/page.tsx          # Main scanner page
│   └── api/ai/
│       ├── scan-ingredients/route.ts    # Scan API
│       └── chat-recipe/route.ts         # Chat API
├── lib/
│   ├── gemini-vision.ts                 # AI logic
│   └── logger.ts                        # Logging utility
└── components/
    └── ScannerGuide.tsx                 # Tips component
```

## 🧪 Quick Test

### Test 1: Basic Scan
1. Login as member (or create account)
2. Go to `/kulkas/scanner`
3. Upload test image with vegetables
4. Click "Scan & Analisis Bahan"
5. Should detect ingredients in ~15-20 seconds

### Test 2: Chat Feature
1. After scan, click "Chat dengan Chef AI"
2. Ask: "Bagaimana cara membuatnya?"
3. Should get response in ~5-10 seconds

## 🔧 Configuration

### Adjust Timeouts
```typescript
// src/lib/gemini-vision.ts
const TIMEOUT_MS = 30_000; // Change to 60_000 for slower networks
```

### Adjust Credit Cost
```typescript
// src/app/api/ai/scan-ingredients/route.ts
const SCAN_CREDIT_COST = 2; // Change to 1 or 3
```

## 📝 Common Issues

### Issue: Camera not working
**Solution:** Ensure HTTPS or localhost (required for camera API)

### Issue: Gemini timeout
**Solution:** Check API key, increase timeout, or check network

### Issue: No ingredients detected
**Solution:** Use clearer photo with better lighting

## 🎯 Next Steps

1. Test on real devices (iOS/Android)
2. Customize UI colors/branding
3. Add more recipe data to database
4. Monitor API usage and costs
5. Collect user feedback

## 📚 Documentation

- Full feature docs: `AI_SCANNER_FEATURE.md`
- Testing guide: `TESTING_SCANNER.md`
- API reference: Check route files

---

**Ready to scan! 📸**
