// Mock data for testing AI Scanner feature

export const mockDetectedIngredients = [
  { name: "Tomat", confidence: 0.95 },
  { name: "Bawang Merah", confidence: 0.88 },
  { name: "Bawang Putih", confidence: 0.92 },
  { name: "Cabai Merah", confidence: 0.85 },
  { name: "Telur", confidence: 0.90 },
];

export const mockRecipeSuggestions = [
  {
    _id: "mock-1",
    title: "Sambal Goreng Telur",
    slug: "sambal-goreng-telur",
    description: "Sambal goreng telur yang pedas dan gurih",
    image: "/images/sambal-telur.jpg",
    category: "Lauk",
    servings: 4,
    matchScore: 95,
    reason: "Semua bahan utama tersedia: telur, tomat, cabai, dan bumbu dasar",
    estimatedCalories: 280,
    nutritionInfo: {
      protein: 18,
      carbs: 12,
      fat: 20,
    },
  },
  {
    _id: "mock-2",
    title: "Tumis Tomat Telur",
    slug: "tumis-tomat-telur",
    description: "Tumisan sederhana yang lezat",
    image: "/images/tumis-tomat.jpg",
    category: "Lauk",
    servings: 2,
    matchScore: 88,
    reason: "Cocok untuk menu cepat dengan tomat dan telur yang ada",
    estimatedCalories: 220,
    nutritionInfo: {
      protein: 15,
      carbs: 8,
      fat: 16,
    },
  },
  {
    _id: "mock-3",
    title: "Sambal Matah",
    slug: "sambal-matah",
    description: "Sambal khas Bali yang segar",
    image: "/images/sambal-matah.jpg",
    category: "Sambal",
    servings: 6,
    matchScore: 75,
    reason: "Bisa dibuat dengan bawang merah, cabai, dan bumbu yang tersedia",
    estimatedCalories: 45,
    nutritionInfo: {
      protein: 1,
      carbs: 8,
      fat: 2,
    },
  },
];

export const mockChatHistory = [
  {
    role: "assistant" as const,
    content: "Halo! Saya Chef AI Dapur Ardya. Saya siap membantu kamu memasak. Tanya apa saja!",
    timestamp: new Date(),
  },
  {
    role: "user" as const,
    content: "Bagaimana cara membuat sambal goreng telur?",
    timestamp: new Date(),
  },
  {
    role: "assistant" as const,
    content: "Berikut langkah-langkahnya:\n1. Rebus telur hingga matang, kupas dan goreng hingga kecokelatan\n2. Tumis bumbu halus (bawang merah, bawang putih, cabai) hingga harum\n3. Masukkan tomat, aduk hingga layu\n4. Tambahkan telur goreng, beri garam dan gula\n5. Masak hingga bumbu meresap. Siap disajikan!",
    timestamp: new Date(),
  },
];

// Test scenarios for different image types
export const testScenarios = {
  clearImage: {
    description: "Well-lit photo with 3-5 visible ingredients",
    expectedIngredients: 3,
    expectedConfidence: 0.8,
    expectedRecipes: 2,
  },
  blurryImage: {
    description: "Out-of-focus photo",
    expectedIngredients: 1,
    expectedConfidence: 0.6,
    expectedRecipes: 0,
  },
  darkImage: {
    description: "Poor lighting conditions",
    expectedIngredients: 0,
    expectedConfidence: 0.5,
    expectedRecipes: 0,
  },
  emptyImage: {
    description: "Photo without food items",
    expectedIngredients: 0,
    expectedConfidence: 0,
    expectedRecipes: 0,
  },
  complexImage: {
    description: "Many ingredients (10+)",
    expectedIngredients: 10,
    expectedConfidence: 0.7,
    expectedRecipes: 3,
  },
};

// Sample base64 image for testing (1x1 transparent PNG)
export const sampleBase64Image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

// Error scenarios
export const errorScenarios = {
  insufficientCredits: {
    credits: 1,
    expectedError: "Credit tidak cukup untuk scan",
    expectedStatus: 403,
  },
  unauthorized: {
    session: null,
    expectedError: "Unauthorized",
    expectedStatus: 401,
  },
  invalidImage: {
    image: "not-a-valid-base64",
    expectedError: "Image data required",
    expectedStatus: 400,
  },
  apiTimeout: {
    timeout: 30000,
    expectedError: "Request timed out",
    expectedStatus: 500,
  },
};
