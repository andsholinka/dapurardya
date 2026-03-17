# Testing Guide - AI Scanner Feature

## 🧪 Manual Testing Checklist

### Pre-requisites
- [ ] GEMINI_API_KEY configured in .env
- [ ] MongoDB connection working
- [ ] Member account created with credits
- [ ] Test on multiple devices (iOS, Android, Desktop)

---

## 1️⃣ Authentication & Authorization

### Test Case 1.1: Non-member Access
**Steps:**
1. Logout dari member account
2. Navigate to `/kulkas/scanner`
3. Try to scan image

**Expected:**
- [ ] Shows "Scanner AI Khusus Member" banner
- [ ] "Masuk Member" and "Daftar Member" buttons visible
- [ ] Cannot scan without login
- [ ] Redirects to `/member/auth?tab=login` when attempting scan

### Test Case 1.2: Member with Insufficient Credits
**Steps:**
1. Login as member with 0-1 credits
2. Navigate to `/kulkas/scanner`
3. Upload image and click scan

**Expected:**
- [ ] Shows credit warning
- [ ] Error message: "Kuota Chef AI kamu habis"
- [ ] Redirects to `/member/upgrade`
- [ ] Credits not deducted

### Test Case 1.3: Member with Sufficient Credits
**Steps:**
1. Login as member with 2+ credits
2. Navigate to `/kulkas/scanner`
3. Complete scan successfully

**Expected:**
- [ ] Scan proceeds normally
- [ ] 2 credits deducted after scan
- [ ] Updated credit count displayed

### Test Case 1.4: Admin Member
**Steps:**
1. Login as admin
2. Perform multiple scans and chats

**Expected:**
- [ ] Unlimited scans allowed
- [ ] Unlimited chats allowed
- [ ] Credits not deducted
- [ ] No credit warnings

---

## 2️⃣ Camera Functionality

### Test Case 2.1: Open Camera (Mobile - iOS)
**Device:** iPhone (Safari)
**Steps:**
1. Click "Buka Kamera"
2. Allow camera permissions

**Expected:**
- [ ] Camera permission prompt appears
- [ ] Rear camera opens (environment facing)
- [ ] Video preview shows in real-time
- [ ] "Ambil Foto" button visible
- [ ] Close (X) button works

### Test Case 2.2: Open Camera (Mobile - Android)
**Device:** Android (Chrome)
**Steps:**
1. Click "Buka Kamera"
2. Allow camera permissions

**Expected:**
- [ ] Camera permission prompt appears
- [ ] Rear camera opens
- [ ] Video preview smooth (no lag)
- [ ] Capture button responsive

### Test Case 2.3: Open Camera (Desktop)
**Device:** Desktop/Laptop
**Steps:**
1. Click "Buka Kamera"
2. Allow camera permissions

**Expected:**
- [ ] Webcam opens
- [ ] Video preview displays
- [ ] Can capture photo
- [ ] Can close camera

### Test Case 2.4: Camera Permission Denied
**Steps:**
1. Click "Buka Kamera"
2. Deny camera permissions

**Expected:**
- [ ] Error message: "Tidak bisa mengakses kamera"
- [ ] Suggests using upload instead
- [ ] Upload button still works

### Test Case 2.5: Capture Photo
**Steps:**
1. Open camera
2. Point at ingredients
3. Click "Ambil Foto"

**Expected:**
- [ ] Photo captured successfully
- [ ] Camera stops (stream closed)
- [ ] Preview shows captured image
- [ ] Can delete and retake

---

## 3️⃣ Upload Functionality

### Test Case 3.1: Upload from Gallery (Mobile)
**Steps:**
1. Click "Upload Foto"
2. Select image from gallery

**Expected:**
- [ ] File picker opens
- [ ] Can select image
- [ ] Preview displays correctly
- [ ] Image not distorted

### Test Case 3.2: Upload from Desktop
**Steps:**
1. Click "Upload Foto"
2. Select image from file system

**Expected:**
- [ ] File dialog opens
- [ ] Can browse files
- [ ] Selected image previews
- [ ] Supports JPG, PNG, WEBP

### Test Case 3.3: Upload Large Image
**Steps:**
1. Upload image > 5MB

**Expected:**
- [ ] Image loads (may take time)
- [ ] Compressed before sending to API
- [ ] No browser crash
- [ ] Scan completes successfully

### Test Case 3.4: Upload Invalid File
**Steps:**
1. Try to upload PDF/video/other format

**Expected:**
- [ ] File picker filters to images only
- [ ] Cannot select non-image files
- [ ] Or shows error if selected

### Test Case 3.5: Delete Selected Image
**Steps:**
1. Upload/capture image
2. Click X button on preview

**Expected:**
- [ ] Image removed
- [ ] Back to upload/camera selection
- [ ] Can select new image
- [ ] Previous results cleared

---

## 4️⃣ AI Scanning

### Test Case 4.1: Scan Clear Image
**Test Image:** Well-lit photo with 3-5 visible ingredients
**Steps:**
1. Upload clear image
2. Click "Scan & Analisis Bahan"
3. Wait for results

**Expected:**
- [ ] Loading animation shows
- [ ] Completes within 30 seconds
- [ ] Detects 3-5 ingredients
- [ ] Confidence scores > 70%
- [ ] Ingredient names in Bahasa Indonesia

### Test Case 4.2: Scan Blurry Image
**Test Image:** Out-of-focus photo
**Steps:**
1. Upload blurry image
2. Scan

**Expected:**
- [ ] May detect fewer ingredients
- [ ] Lower confidence scores
- [ ] Or returns "Tidak ada bahan terdeteksi"
- [ ] Suggests retaking photo

### Test Case 4.3: Scan Dark Image
**Test Image:** Poor lighting
**Steps:**
1. Upload dark image
2. Scan

**Expected:**
- [ ] Detects fewer ingredients
- [ ] Lower confidence
- [ ] Or no detection
- [ ] Error message helpful

### Test Case 4.4: Scan Empty/No Ingredients
**Test Image:** Photo without food
**Steps:**
1. Upload image of empty table
2. Scan

**Expected:**
- [ ] Returns empty ingredients array
- [ ] Message: "Tidak ada bahan yang terdeteksi"
- [ ] Suggests trying clearer photo

### Test Case 4.5: Scan Timeout
**Scenario:** API takes > 30 seconds
**Steps:**
1. Simulate slow network
2. Scan image

**Expected:**
- [ ] Timeout after 30 seconds
- [ ] Error message shown
- [ ] Can retry
- [ ] Credits not deducted on timeout

### Test Case 4.6: Scan with API Error
**Scenario:** Gemini API down
**Steps:**
1. Disable GEMINI_API_KEY
2. Try to scan

**Expected:**
- [ ] Error message: "Gagal memindai gambar"
- [ ] Credits not deducted
- [ ] Can retry later
- [ ] Fallback suggestion (if implemented)

---

## 5️⃣ Recipe Suggestions

### Test Case 5.1: Matching Recipes Found
**Scenario:** Detected ingredients match database recipes
**Steps:**
1. Scan image with common ingredients (tomato, onion, chicken)
2. View results

**Expected:**
- [ ] Shows 1-3 recipe suggestions
- [ ] Each has match score (0-100%)
- [ ] Reason text in Bahasa Indonesia
- [ ] Recipe cards clickable
- [ ] Images load correctly

### Test Case 5.2: No Matching Recipes
**Scenario:** Detected ingredients don't match any recipe
**Steps:**
1. Scan image with rare ingredients
2. View results

**Expected:**
- [ ] Shows "Resep yang pas belum ditemukan"
- [ ] Suggests viewing all recipes
- [ ] Link to `/resep` works

### Test Case 5.3: Nutrition Information
**Steps:**
1. Scan and get recipe suggestions
2. Check nutrition badges

**Expected:**
- [ ] Estimated calories shown (~XXX kkal)
- [ ] Protein, Carbs, Fat in grams
- [ ] Values reasonable (not 0 or 10000)
- [ ] Flame icon for calories

### Test Case 5.4: Match Score Accuracy
**Steps:**
1. Scan image with exact recipe ingredients
2. Check match scores

**Expected:**
- [ ] High match score (80-100%)
- [ ] Recipes sorted by score (highest first)
- [ ] Score badge visible
- [ ] Hover effect on badge

---

## 6️⃣ Chat with Chef AI

### Test Case 6.1: Open Chat Modal
**Steps:**
1. Get recipe suggestions
2. Click "Chat dengan Chef AI" on a recipe

**Expected:**
- [ ] Modal opens smoothly
- [ ] Recipe title in header
- [ ] Welcome message from Chef AI
- [ ] Input field ready
- [ ] Close button works

### Test Case 6.2: Send Message
**Steps:**
1. Open chat
2. Type "Bagaimana cara membuat ini?"
3. Press Enter or click Send

**Expected:**
- [ ] Message appears in chat
- [ ] Loading indicator shows
- [ ] AI reply within 10 seconds
- [ ] Reply relevant to recipe
- [ ] Reply in Bahasa Indonesia

### Test Case 6.3: Multi-turn Conversation
**Steps:**
1. Ask: "Berapa lama waktu memasak?"
2. Ask: "Apa bisa pakai bahan lain?"
3. Ask: "Tips agar tidak gosong?"

**Expected:**
- [ ] All messages in history
- [ ] Context maintained
- [ ] Relevant answers
- [ ] Scroll works in chat

### Test Case 6.4: Chat on Mobile
**Device:** Mobile phone
**Steps:**
1. Open chat modal
2. Type message

**Expected:**
- [ ] Modal full-screen on mobile
- [ ] Keyboard doesn't cover input
- [ ] Scroll works
- [ ] Send button accessible

### Test Case 6.5: Chat Error Handling
**Scenario:** AI fails to respond
**Steps:**
1. Simulate API error
2. Send message

**Expected:**
- [ ] Error message: "Maaf, saya tidak bisa merespons"
- [ ] Can retry
- [ ] Chat doesn't crash
- [ ] Previous messages preserved

### Test Case 6.6: Close Chat
**Steps:**
1. Have conversation
2. Close modal
3. Reopen chat on same recipe

**Expected:**
- [ ] Modal closes
- [ ] Can reopen
- [ ] New conversation starts (history cleared)
- [ ] Welcome message shown again

---

## 7️⃣ Responsive Design

### Test Case 7.1: Mobile Portrait (375x667)
**Device:** iPhone SE
**Expected:**
- [ ] All buttons accessible
- [ ] Text readable (not too small)
- [ ] Images fit screen
- [ ] No horizontal scroll
- [ ] Touch targets > 44px

### Test Case 7.2: Mobile Landscape
**Device:** Any phone rotated
**Expected:**
- [ ] Layout adjusts
- [ ] Camera preview fits
- [ ] Chat modal usable
- [ ] No content cut off

### Test Case 7.3: Tablet (768x1024)
**Device:** iPad
**Expected:**
- [ ] Grid layout for recipes (2 columns)
- [ ] Larger buttons
- [ ] Chat modal centered
- [ ] Spacing appropriate

### Test Case 7.4: Desktop (1920x1080)
**Device:** Desktop browser
**Expected:**
- [ ] Max-width container (not full width)
- [ ] 3-column recipe grid
- [ ] Hover effects work
- [ ] Chat modal sized well

### Test Case 7.5: Ultra-wide (2560x1440)
**Expected:**
- [ ] Content centered
- [ ] Not stretched
- [ ] Readable
- [ ] Proper spacing

---

## 8️⃣ Performance

### Test Case 8.1: Page Load Time
**Steps:**
1. Navigate to `/kulkas/scanner`
2. Measure load time

**Expected:**
- [ ] Page loads < 3 seconds
- [ ] No layout shift
- [ ] Images lazy loaded
- [ ] Smooth animations

### Test Case 8.2: Scan Performance
**Steps:**
1. Upload image
2. Measure scan time

**Expected:**
- [ ] Scan completes < 30 seconds
- [ ] Progress indicator shows
- [ ] No UI freeze
- [ ] Can cancel (if implemented)

### Test Case 8.3: Chat Response Time
**Steps:**
1. Send chat message
2. Measure response time

**Expected:**
- [ ] Reply within 10 seconds
- [ ] Loading indicator
- [ ] No timeout
- [ ] Smooth scroll to new message

### Test Case 8.4: Memory Usage
**Steps:**
1. Perform 5 scans
2. Open/close chat multiple times
3. Check browser memory

**Expected:**
- [ ] No memory leaks
- [ ] Camera stream properly closed
- [ ] Images garbage collected
- [ ] No performance degradation

---

## 9️⃣ Edge Cases

### Test Case 9.1: Rapid Clicks
**Steps:**
1. Click "Scan" button rapidly 5 times

**Expected:**
- [ ] Only one scan triggered
- [ ] Button disabled during scan
- [ ] No duplicate API calls
- [ ] Credits deducted once

### Test Case 9.2: Network Offline
**Steps:**
1. Disable network
2. Try to scan

**Expected:**
- [ ] Error message: "Tidak bisa terhubung"
- [ ] Retry option
- [ ] No crash
- [ ] Credits not deducted

### Test Case 9.3: Session Expired
**Steps:**
1. Start scan
2. Session expires mid-scan

**Expected:**
- [ ] Redirects to login
- [ ] Error message clear
- [ ] Can login and retry
- [ ] Credits not deducted

### Test Case 9.4: Browser Back Button
**Steps:**
1. Scan image
2. View results
3. Click browser back

**Expected:**
- [ ] Returns to previous page
- [ ] Or clears results
- [ ] No errors
- [ ] Can scan again

### Test Case 9.5: Multiple Tabs
**Steps:**
1. Open scanner in 2 tabs
2. Scan in both

**Expected:**
- [ ] Both work independently
- [ ] Credits deducted correctly
- [ ] No race conditions
- [ ] Session consistent

---

## 🔟 Accessibility

### Test Case 10.1: Keyboard Navigation
**Steps:**
1. Navigate using Tab key
2. Activate using Enter/Space

**Expected:**
- [ ] All interactive elements focusable
- [ ] Focus visible (outline)
- [ ] Logical tab order
- [ ] Can operate without mouse

### Test Case 10.2: Screen Reader
**Tool:** VoiceOver (iOS) or TalkBack (Android)
**Expected:**
- [ ] Buttons announced correctly
- [ ] Images have alt text
- [ ] Status messages announced
- [ ] Chat messages readable

### Test Case 10.3: Color Contrast
**Tool:** Browser DevTools or WAVE
**Expected:**
- [ ] Text contrast ratio > 4.5:1
- [ ] Interactive elements distinguishable
- [ ] Not relying on color alone
- [ ] Readable in grayscale

### Test Case 10.4: Text Scaling
**Steps:**
1. Increase browser text size to 200%

**Expected:**
- [ ] Text scales properly
- [ ] No text cut off
- [ ] Layout doesn't break
- [ ] Still usable

---

## 📊 Test Results Template

```
Date: ___________
Tester: ___________
Device: ___________
Browser: ___________

| Test Case | Status | Notes |
|-----------|--------|-------|
| 1.1       | ✅/❌   |       |
| 1.2       | ✅/❌   |       |
| ...       | ✅/❌   |       |

Issues Found:
1. 
2. 
3. 

Overall Assessment: ___________
```

---

## 🐛 Bug Report Template

```markdown
**Bug Title:** [Short description]

**Severity:** Critical / High / Medium / Low

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Result:**


**Actual Result:**


**Screenshots:**
[Attach if applicable]

**Environment:**
- Device: 
- OS: 
- Browser: 
- Version: 

**Additional Notes:**

```

---

## ✅ Sign-off Checklist

Before deploying to production:

- [ ] All critical test cases passed
- [ ] Tested on iOS Safari
- [ ] Tested on Android Chrome
- [ ] Tested on Desktop Chrome/Firefox
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Accessibility checked
- [ ] Error handling verified
- [ ] Credit system working
- [ ] Documentation complete
- [ ] Stakeholder approval

---

**Happy Testing! 🧪**
