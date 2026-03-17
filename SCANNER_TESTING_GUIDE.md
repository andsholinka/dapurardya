# 🧪 Scanner AI Testing Guide

## ✅ Status: Ready for Testing

Database telah diisi dengan 3 sample recipes untuk testing Scanner AI feature.

---

## 📦 Sample Recipes yang Sudah Diimport

### 1. Omelet Sosis Keju Jamur ✅ COCOK
- **Slug**: `omelet-sosis-keju-jamur`
- **Bahan**: Telur, Sosis, Keju, Jamur, Susu, Mayones
- **Expected Match**: 90-95% dengan foto kulkas test
- **Kategori**: Sarapan
- **Difficulty**: Mudah

### 2. Salad Segar Alpukat Apel ✅ COCOK
- **Slug**: `salad-segar-alpukat-apel`
- **Bahan**: Alpukat, Apel, Selada, Jamur, Jeruk, Mayones, Keju
- **Expected Match**: 80-85% dengan foto kulkas test
- **Kategori**: Salad
- **Difficulty**: Mudah

### 3. Rendang Daging Sapi Padang ❌ TIDAK COCOK
- **Slug**: `rendang-daging-sapi-padang`
- **Bahan**: Daging sapi, santan, bumbu rempah (tidak ada di foto)
- **Expected Match**: 0-20% (negative test case)
- **Kategori**: Lauk Utama
- **Difficulty**: Sulit

---

## 🧪 Test Scenarios

### Test 1: Ingredient Detection
**Goal**: Verify AI can detect ingredients from photo

**Steps**:
1. Login sebagai member (bukan admin untuk test credit deduction)
2. Buka `/kulkas/scanner`
3. Upload foto kulkas test (`public/qrcode.jpeg` atau foto lain)
4. Klik "Scan & Analisis Bahan"

**Expected Results**:
- ✅ Deteksi minimal 8-12 bahan
- ✅ Confidence score > 60% untuk setiap bahan
- ✅ Bahan dalam Bahasa Indonesia
- ✅ Credits berkurang 2 (dari header)
- ✅ Loading state muncul saat scanning

**Bahan yang Seharusnya Terdeteksi** (dari foto test):
- Sosis
- Keju
- Telur
- Jamur
- Susu
- Mayones
- Alpukat
- Apel
- Selada
- Jeruk
- Brokoli
- Nanas
- Saus Tomat
- Kacang Polong

---

### Test 2: Recipe Matching
**Goal**: Verify AI matches detected ingredients to recipes

**Expected Results**:
- ✅ Muncul 2 resep yang cocok (Omelet & Salad)
- ✅ Match score 80-95% untuk kedua resep
- ✅ Rendang TIDAK muncul atau match score < 30%
- ✅ Setiap resep punya reason yang masuk akal
- ✅ Estimasi kalori muncul (400-600 kkal range)
- ✅ Nutrition info (protein, carbs, fat) muncul

**Recipe Card Should Show**:
- Title
- Description
- Category
- Match score badge
- Estimated calories with flame icon
- Nutrition breakdown (P/C/F)
- Reason for match
- "Chat dengan Chef AI" button

---

### Test 3: Chat with Chef AI
**Goal**: Verify chat functionality works

**Steps**:
1. Setelah scan, klik "Chat dengan Chef AI" pada salah satu resep
2. Modal chat terbuka
3. Kirim pesan: "Bagaimana cara membuat omelet yang lembut?"
4. Tunggu response dari Chef AI
5. Kirim pesan kedua: "Berapa lama waktu memasaknya?"

**Expected Results**:
- ✅ Modal chat terbuka dengan header resep
- ✅ Welcome message dari Chef AI muncul
- ✅ First message: Credits berkurang 1 (new session)
- ✅ Second message: Credits TIDAK berkurang (same session)
- ✅ Chef AI response dalam Bahasa Indonesia
- ✅ Response relevan dengan resep
- ✅ Response 2-4 kalimat, informatif
- ✅ Loading state saat menunggu response

---

### Test 4: Credit System
**Goal**: Verify credit deduction works correctly

**Initial State**:
- Member baru: 5 credits
- Admin: unlimited (tidak dipotong)

**Test as Member**:
1. Check credits di header: 5 credits
2. Scan foto: Credits jadi 3 (5 - 2)
3. Chat session baru: Credits jadi 2 (3 - 1)
4. Chat lagi (same session): Credits tetap 2
5. Close chat, buka chat resep lain: Credits jadi 1 (2 - 1, new session)

**Test as Admin**:
1. Login sebagai admin
2. Scan foto: Credits tetap unlimited
3. Chat: Credits tetap unlimited
4. Tidak ada error atau warning

**Expected Results**:
- ✅ Credits auto-update di header setelah scan/chat
- ✅ Admin tidak dipotong credits
- ✅ Member dipotong sesuai aturan
- ✅ Error message jika credits habis
- ✅ Redirect ke upgrade page jika credits < 2

---

### Test 5: Error Handling
**Goal**: Verify error states work correctly

**Test Cases**:

**5.1 No Image Selected**
- Klik "Scan" tanpa upload foto
- Expected: Button disabled atau error message

**5.2 Invalid Image**
- Upload file non-image (PDF, TXT)
- Expected: Error "File tidak valid"

**5.3 Dark Image**
- Upload foto yang sangat gelap
- Expected: Warning "Foto terlalu gelap"

**5.4 No Ingredients Detected**
- Upload foto yang tidak ada bahan makanan
- Expected: Message "Tidak ada bahan yang terdeteksi"

**5.5 Insufficient Credits**
- Member dengan 1 credit coba scan (butuh 2)
- Expected: Error "Credit tidak cukup" + redirect upgrade

**5.6 Not Logged In**
- Logout, coba akses scanner
- Expected: Prompt login atau redirect ke `/member/auth`

---

## 🔍 What to Check in Terminal Logs

Saat testing, perhatikan log di terminal untuk debugging:

```
✅ Good Logs:
[SCAN_AI] Scanning image for ingredients
[GEMINI_VISION] Gemini Vision response: "[{\"name\":\"Telur\",..."
[SCAN_AI] Scan completed successfully
[GEMINI_VISION] Mapping 3 AI suggestions to recipes
[GEMINI_VISION] Matched recipe: omelet-sosis-keju-jamur
[GEMINI_VISION] Final suggestions count: 2

❌ Bad Logs (Need Investigation):
[GEMINI_VISION] Vision scan attempt 1/2 failed, retrying...
[GEMINI_VISION] Recipe not found in database: xxx
[SCAN_AI] Error: ...
```

---

## 🐛 Known Issues & Workarounds

### Issue 1: Credits Not Syncing in Header
**Symptom**: Header masih show old credits setelah scan
**Fix**: Already implemented `credits:update` event
**Verify**: Check browser console for event dispatch

### Issue 2: Empty Recipe List
**Symptom**: Bahan terdeteksi tapi tidak ada resep
**Cause**: Database recipes kosong
**Fix**: Run `node scripts/import-sample-recipes.mjs` ✅ DONE

### Issue 3: Gemini API Timeout
**Symptom**: Scan stuck di loading > 30 detik
**Cause**: API timeout atau rate limit
**Fix**: Retry mechanism sudah ada (MAX_RETRIES = 2)

---

## 📊 Success Criteria

Feature dianggap berhasil jika:

- ✅ Ingredient detection accuracy > 80%
- ✅ Recipe matching relevant (match score > 70%)
- ✅ Credit system works correctly
- ✅ Chat AI response < 5 detik
- ✅ No console errors
- ✅ Mobile responsive (test di HP)
- ✅ Credits auto-update di header
- ✅ Admin unlimited works
- ✅ Error handling graceful

---

## 🚀 Next Steps After Testing

1. **Add More Recipes**: Import real recipes via admin panel
2. **Fine-tune AI Prompts**: Adjust if matching tidak akurat
3. **Performance**: Monitor API costs dan response time
4. **UX Improvements**: Tambah animations, better loading states
5. **Analytics**: Track scan success rate, popular recipes

---

## 📝 Testing Checklist

Copy checklist ini untuk testing:

```
□ Test 1: Ingredient Detection
  □ Upload foto berhasil
  □ Scan berhasil detect bahan
  □ Credits berkurang 2
  □ Bahan dalam Bahasa Indonesia
  
□ Test 2: Recipe Matching
  □ 2 resep cocok muncul
  □ Match score masuk akal
  □ Nutrition info muncul
  □ Reason relevan
  
□ Test 3: Chat with Chef AI
  □ Modal chat buka
  □ First message: credits -1
  □ Second message: credits tetap
  □ Response relevan
  
□ Test 4: Credit System
  □ Member: credits berkurang
  □ Admin: unlimited works
  □ Header auto-update
  
□ Test 5: Error Handling
  □ Invalid file rejected
  □ Dark image warning
  □ Insufficient credits handled
  □ Not logged in handled
```

---

## 🎯 Ready to Test!

Semua sudah siap:
- ✅ 3 sample recipes imported
- ✅ Gemini models configured
- ✅ Credit system implemented
- ✅ Chat AI ready
- ✅ Error handling in place

**Start Testing**: http://localhost:3000/kulkas/scanner

Good luck! 🚀
