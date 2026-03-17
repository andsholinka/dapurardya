# Import Sample Recipes untuk Testing Scanner

## 📦 Sample Recipes yang Disediakan

### 1. Omelet Sosis Keju Jamur ✅ COCOK
**Bahan utama:** Telur, Sosis, Keju, Jamur, Susu, Mayones
- Match dengan foto kulkas: **TINGGI** (90%+)
- Semua bahan ada di kulkas
- Cocok untuk testing AI matching

### 2. Salad Segar Alpukat Apel ✅ COCOK
**Bahan utama:** Alpukat, Apel, Selada, Jamur, Jeruk, Mayones, Keju
- Match dengan foto kulkas: **TINGGI** (85%+)
- Hampir semua bahan ada di kulkas
- Cocok untuk testing nutrition info

### 3. Rendang Daging Sapi Padang ❌ TIDAK COCOK
**Bahan utama:** Daging sapi, Santan, Bumbu rempah lengkap
- Match dengan foto kulkas: **RENDAH** (0-20%)
- Tidak ada bahan yang match
- Cocok untuk testing negative case

## 🚀 Cara Import

### Option 1: Via Script (Recommended)

```bash
# Pastikan sudah di root folder project
node scripts/import-sample-recipes.mjs
```

**Output yang diharapkan:**
```
🔌 Connecting to MongoDB...
✅ Connected to MongoDB
📦 Found 3 recipes to import
✅ Imported: Omelet Sosis Keju Jamur
✅ Imported: Salad Segar Alpukat Apel
✅ Imported: Rendang Daging Sapi Padang

🎉 Import completed successfully!

📋 Summary:
   - Omelet Sosis Keju Jamur (COCOK dengan foto kulkas)
   - Salad Segar Alpukat Apel (COCOK dengan foto kulkas)
   - Rendang Daging Sapi Padang (TIDAK COCOK - untuk testing)

💡 Sekarang coba scan foto kulkas lagi!

👋 Connection closed
```

### Option 2: Via MongoDB Compass

1. Buka MongoDB Compass
2. Connect ke database `dapurardya`
3. Pilih collection `recipes`
4. Klik "ADD DATA" → "Import JSON or CSV file"
5. Pilih file `sample-recipes-scanner-test.json`
6. Klik "Import"

### Option 3: Via mongoimport CLI

```bash
mongoimport --uri="your_mongodb_uri" \
  --db=dapurardya \
  --collection=recipes \
  --file=sample-recipes-scanner-test.json \
  --jsonArray
```

## 🧪 Testing Flow

### 1. Import Recipes
```bash
node scripts/import-sample-recipes.mjs
```

### 2. Restart Dev Server
```bash
# Stop server (Ctrl+C)
npm run dev
```

### 3. Test Scanner
1. Login sebagai member
2. Go to `/kulkas/scanner`
3. Upload foto kulkas (yang sama dengan sebelumnya)
4. Klik "Scan & Analisis Bahan"

### 4. Expected Results

**Bahan Terdeteksi:** (sama seperti sebelumnya)
- Sosis, Keju, Telur, Jamur, Susu, Mayones, dll.

**Resep yang Disarankan:** (NEW!)
- ✅ **Omelet Sosis Keju Jamur** - Match Score: 90-95%
  - Reason: "Semua bahan utama tersedia: telur, sosis, keju, jamur, susu, dan mayones"
  - Calories: ~350 kkal
  - Nutrition: P: 25g, C: 8g, F: 24g

- ✅ **Salad Segar Alpukat Apel** - Match Score: 80-85%
  - Reason: "Cocok untuk menu sehat dengan alpukat, apel, selada, jamur, dan mayones yang ada"
  - Calories: ~280 kkal
  - Nutrition: P: 5g, C: 22g, F: 20g

- ❌ **Rendang Daging Sapi** - TIDAK MUNCUL atau Match Score: 0-10%
  - Reason: "Bahan utama tidak tersedia"

### 5. Test Chat Feature
1. Klik "Chat dengan Chef AI" pada salah satu resep
2. Tanya: "Bagaimana cara membuatnya?"
3. AI akan kasih panduan step-by-step

### 6. Verify Credits
- Credits di header harus auto-update (berkurang 2)
- Tidak perlu refresh

## 🔍 Troubleshooting

### Script Error: "Cannot find module"
```bash
# Install dependencies
npm install
```

### Script Error: "MONGODB_URI not found"
```bash
# Check .env.local
cat .env.local | grep MONGODB_URI
```

### Recipes Not Showing After Import
```bash
# Check if recipes imported successfully
# Via MongoDB Compass or mongosh:
db.recipes.find({ published: true }).count()
# Should return 3 or more
```

### AI Still Returns Empty Recipes
1. Check logs for "Recipe not found in database: xxx"
2. Verify slug matches exactly
3. Check if `published: true`

## 📊 Validation Checklist

After import, verify:
- [ ] 3 recipes in database
- [ ] All recipes have `published: true`
- [ ] Slugs are correct: `omelet-sosis-keju-jamur`, `salad-segar-alpukat-apel`, `rendang-daging-sapi-padang`
- [ ] Scanner returns 2 matching recipes (Omelet & Salad)
- [ ] Match scores are reasonable (80-95%)
- [ ] Nutrition info is present
- [ ] Credits auto-update after scan
- [ ] Chat feature works

## 🎯 Next Steps

After successful testing:
1. Add more real recipes via `/admin/resep/new`
2. Test with different photos
3. Fine-tune AI prompts if needed
4. Deploy to production

---

**Happy Testing! 🧪**
