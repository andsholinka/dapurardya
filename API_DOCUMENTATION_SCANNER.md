# API Documentation - AI Scanner

## Endpoints

### 1. Scan Ingredients

**Endpoint:** `POST /api/ai/scan-ingredients`

**Description:** Scan image and detect ingredients using Gemini Vision AI

**Authentication:** Required (Member session)

**Request Body:**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

**Success Response (200):**
```json
{
  "ingredients": [
    {
      "name": "Tomat",
      "confidence": 0.95
    },
    {
      "name": "Bawang Merah",
      "confidence": 0.88
    }
  ],
  "recipes": [
    {
      "_id": "65f1234567890abcdef12345",
      "title": "Sambal Goreng Telur",
      "slug": "sambal-goreng-telur",
      "description": "Sambal goreng telur yang pedas dan gurih",
      "image": "/images/sambal-telur.jpg",
      "category": "Lauk",
      "servings": 4,
      "matchScore": 95,
      "reason": "Semua bahan utama tersedia",
      "estimatedCalories": 280,
      "nutritionInfo": {
        "protein": 18,
        "carbs": 12,
        "fat": 20
      }
    }
  ],
  "aiStatus": {
    "credits": 1,
    "canUseAI": true
  }
}
```

**Error Responses:**

**401 Unauthorized:**
```json
{
  "error": "Unauthorized"
}
```

**403 Insufficient Credits:**
```json
{
  "error": "Credit tidak cukup untuk scan. Butuh 2 credit.",
  "aiStatus": {
    "credits": 0,
    "canUseAI": false
  }
}
```

**400 Bad Request:**
```json
{
  "error": "Image data required"
}
```

**500 Server Error:**
```json
{
  "error": "Gagal memindai gambar. Coba lagi."
}
```

---

### 2. Chat with Recipe

**Endpoint:** `POST /api/ai/chat-recipe`

**Description:** Chat with Chef AI about a specific recipe. First message in session costs 1 credit, subsequent messages are free.

**Authentication:** Required (Member session)

**Request Body:**
```json
{
  "recipeSlug": "sambal-goreng-telur",
  "message": "Bagaimana cara membuat ini?",
  "isNewSession": true,
  "history": [
    {
      "role": "assistant",
      "content": "Halo! Saya Chef AI...",
      "timestamp": "2026-03-17T10:00:00Z"
    }
  ]
}
```

**Success Response (200):**
```json
{
  "reply": "Berikut langkah-langkahnya:\n1. Rebus telur hingga matang...\n2. Tumis bumbu halus...\n3. Masukkan tomat..."
}
```

**Error Responses:**

**401 Unauthorized:**
```json
{
  "error": "Unauthorized"
}
```

**403 Insufficient Credits (New Session Only):**
```json
{
  "error": "Credit tidak cukup untuk chat. Butuh 1 credit.",
  "aiStatus": {
    "credits": 0,
    "canUseAI": false
  }
}
```

**400 Bad Request:**
```json
{
  "error": "Recipe slug and message required"
}
```

**404 Not Found:**
```json
{
  "error": "Recipe not found"
}
```

**500 Server Error:**
```json
{
  "error": "Chef AI tidak bisa merespons sekarang."
}
```

---

## Data Models

### DetectedIngredient
```typescript
interface DetectedIngredient {
  name: string;        // Nama bahan dalam Bahasa Indonesia
  confidence: number;  // 0.0 - 1.0
}
```

### RecipeSuggestion
```typescript
interface RecipeSuggestion {
  _id: string;
  title: string;
  slug: string;
  description: string;
  image?: string;
  images?: string[];
  category: string;
  servings?: number;
  matchScore: number;           // 0-100
  reason: string;               // Alasan rekomendasi
  estimatedCalories?: number;   // Kalori per porsi
  nutritionInfo?: {
    protein: number;            // gram
    carbs: number;              // gram
    fat: number;                // gram
  };
}
```

### ChatMessage
```typescript
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}
```

### AIStatus
```typescript
interface AIStatus {
  credits: number;
  canUseAI: boolean;
}
```

---

## Rate Limits

- **Scan**: Limited by credits (2 per scan)
- **Chat**: Limited by credits (1 per session, unlimited messages within session)
- **Timeout**: 30s for scan, 10s for chat
- **Admin**: Unlimited (no credit deduction)

---

## Error Codes

| Code | Description |
|------|-------------|
| 400  | Bad Request - Invalid input |
| 401  | Unauthorized - Not logged in |
| 403  | Forbidden - Insufficient credits |
| 404  | Not Found - Recipe not found |
| 500  | Server Error - Internal error |

---

## Example Usage

### JavaScript/TypeScript
```typescript
// Scan ingredients
const scanIngredients = async (imageBase64: string) => {
  const response = await fetch('/api/ai/scan-ingredients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: imageBase64 }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }
  
  return await response.json();
};

// Chat with recipe
const chatWithRecipe = async (
  recipeSlug: string,
  message: string,
  history: ChatMessage[],
  isNewSession: boolean
) => {
  const response = await fetch('/api/ai/chat-recipe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipeSlug, message, history, isNewSession }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }
  
  return await response.json();
};
```

---

## Testing

### cURL Examples

**Scan Ingredients:**
```bash
curl -X POST http://localhost:3000/api/ai/scan-ingredients \
  -H "Content-Type: application/json" \
  -H "Cookie: member-session=your_session_token" \
  -d '{"image":"data:image/jpeg;base64,..."}'
```

**Chat with Recipe:**
```bash
curl -X POST http://localhost:3000/api/ai/chat-recipe \
  -H "Content-Type: application/json" \
  -H "Cookie: member-session=your_session_token" \
  -d '{
    "recipeSlug": "sambal-goreng-telur",
    "message": "Bagaimana cara membuat ini?",
    "isNewSession": true,
    "history": []
  }'
```

---

## Notes

- Image must be base64 encoded
- Maximum image size: 10MB (before compression)
- Recommended: Compress to < 2MB for faster upload
- Scan timeout: 30 seconds
- Chat timeout: 10 seconds
- Scan: 2 credits per scan
- Chat: 1 credit per session (first message), unlimited messages after
- Admin: Unlimited (no credit deduction)
- Credits deducted only on successful operation

---

**API Version:** 1.0.0  
**Last Updated:** March 17, 2026
