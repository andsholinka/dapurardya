"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Camera, Upload, Sparkles, Loader2, X, MessageSquare, Send, ChefHat, Utensils, Flame, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecipeCard } from "@/components/RecipeCard";
import { ScannerGuide } from "@/components/ScannerGuide";
import { compressImage, validateImageFile, checkImageBrightness } from "@/lib/image-utils";
import Link from "next/link";
import Image from "next/image";

interface DetectedIngredient {
  name: string;
  confidence: number;
}

interface SuggestedRecipe {
  _id: string;
  title: string;
  slug: string;
  description: string;
  image?: string;
  images?: string[];
  category: string;
  servings?: number;
  matchScore: number;
  reason: string;
  estimatedCalories?: number;
  nutritionInfo?: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function FridgeScannerPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [member, setMember] = useState<any>(null);
  const [aiStatus, setAIStatus] = useState<any>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [detectedIngredients, setDetectedIngredients] = useState<DetectedIngredient[]>([]);
  const [suggestedRecipes, setSuggestedRecipes] = useState<SuggestedRecipe[]>([]);
  const [error, setError] = useState("");
  
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [selectedRecipeForChat, setSelectedRecipeForChat] = useState<SuggestedRecipe | null>(null);
  const [isNewChatSession, setIsNewChatSession] = useState(true);
  
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    loadAIStatus();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  async function loadAIStatus() {
    try {
      const res = await fetch("/api/member/ai-status");
      const data = await res.json();
      setMember(data.member ?? null);
      setAIStatus(data.aiStatus ?? null);
    } catch (error) {
      // silent
    } finally {
      setStatusLoading(false);
    }
  }

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setCameraActive(true);
      }
    } catch (err) {
      setError("Tidak bisa mengakses kamera. Gunakan upload foto saja.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL("image/jpeg", 0.8);
      setSelectedImage(imageData);
      stopCamera();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || "File tidak valid");
      return;
    }
    
    try {
      // Compress image
      const compressed = await compressImage(file);
      setSelectedImage(compressed);
      
      // Check brightness
      const brightness = await checkImageBrightness(compressed);
      if (brightness < 50) {
        setError("Foto terlalu gelap. Coba dengan pencahayaan lebih baik.");
      }
    } catch (err) {
      setError("Gagal memproses gambar. Coba lagi.");
    }
  };

  const handleScan = async () => {
    if (!selectedImage) return;
    
    if (!member) {
      setError("Masuk sebagai member untuk menggunakan Scanner AI.");
      router.push("/member/auth?tab=login");
      return;
    }
    
    if (aiStatus && !aiStatus.canUseAI) {
      setError("Kuota Chef AI kamu habis. Upgrade untuk lanjut.");
      router.push("/member/upgrade");
      return;
    }

    setScanning(true);
    setError("");
    
    try {
      const res = await fetch("/api/ai/scan-ingredients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: selectedImage }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Gagal memindai gambar.");
        return;
      }
      
      setDetectedIngredients(data.ingredients || []);
      setSuggestedRecipes(data.recipes || []);
      
      if (data.aiStatus) {
        setAIStatus(data.aiStatus);
        // Trigger event to update header credits
        window.dispatchEvent(new CustomEvent("credits:update", { 
          detail: { credits: data.aiStatus.credits } 
        }));
      }
    } catch (err) {
      setError("Terjadi kesalahan saat memindai. Coba lagi.");
    } finally {
      setScanning(false);
    }
  };

  const startChatWithRecipe = (recipe: SuggestedRecipe) => {
    setSelectedRecipeForChat(recipe);
    setShowChat(true);
    setIsNewChatSession(true);
    setChatMessages([
      {
        role: "assistant",
        content: `Halo! Saya Chef AI Dapur Ardya. Saya siap membantu kamu memasak "${recipe.title}". Tanya apa saja tentang resep ini!\n\n💡 Chat ini menggunakan 1 credit untuk sesi unlimited. Setelah itu kamu bisa tanya sebanyak yang kamu mau!`,
        timestamp: new Date(),
      }
    ]);
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || !selectedRecipeForChat) return;
    
    const userMessage: ChatMessage = {
      role: "user",
      content: chatInput,
      timestamp: new Date(),
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");
    setChatLoading(true);
    
    try {
      const res = await fetch("/api/ai/chat-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipeSlug: selectedRecipeForChat.slug,
          message: chatInput,
          history: chatMessages,
          isNewSession: isNewChatSession,
        }),
      });
      
      const data = await res.json();
      
      if (res.ok && data.reply) {
        setChatMessages(prev => [...prev, {
          role: "assistant",
          content: data.reply,
          timestamp: new Date(),
        }]);
        
        // After first message, no longer new session
        if (isNewChatSession) {
          setIsNewChatSession(false);
        }
      } else {
        // Handle error
        setChatMessages(prev => [...prev, {
          role: "assistant",
          content: data.error || "Maaf, saya tidak bisa merespons sekarang. Coba lagi nanti.",
          timestamp: new Date(),
        }]);
        
        // If credit error, reload AI status
        if (data.aiStatus) {
          setAIStatus(data.aiStatus);
          // Trigger event to update header credits
          window.dispatchEvent(new CustomEvent("credits:update", { 
            detail: { credits: data.aiStatus.credits } 
          }));
        }
      }
    } catch (err) {
      setChatMessages(prev => [...prev, {
        role: "assistant",
        content: "Maaf, saya tidak bisa merespons sekarang. Coba lagi nanti.",
        timestamp: new Date(),
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 md:py-12">
      {/* Header */}
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-600 text-xs font-bold uppercase tracking-wider">
          <Camera className="size-3" />
          AI Vision Scanner
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">
          Scan <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Kulkasmu</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Foto isi kulkas atau bahan makanan, dan Chef AI akan mendeteksi bahan serta menyarankan resep lengkap dengan estimasi kalori.
        </p>
      </div>

      {/* Member Status */}
      {statusLoading ? (
        <div className="max-w-3xl mx-auto mb-8 rounded-2xl border-2 border-border/60 bg-card px-5 py-4 text-sm text-muted-foreground">
          Mengecek akses Scanner AI...
        </div>
      ) : !member ? (
        <div className="max-w-3xl mx-auto mb-8 rounded-3xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 px-5 py-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-purple-100 p-3 text-purple-600">
              <Camera className="size-5" />
            </div>
            <div className="flex-1 space-y-2">
              <h2 className="text-lg font-semibold">Scanner AI Khusus Member</h2>
              <p className="text-sm text-muted-foreground">
                Fitur ini memerlukan 2 Credit untuk setiap scan. Daftar sekarang dan dapatkan 3 Credit gratis!
              </p>
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <Link href="/member/auth?tab=login">
                  <Button className="rounded-xl w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600">
                    Masuk Member
                  </Button>
                </Link>
                <Link href="/member/auth?tab=register">
                  <Button variant="outline" className="rounded-xl w-full sm:w-auto">
                    Daftar Member
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Scanner Guide */}
      <div className="max-w-4xl mx-auto mb-8">
        <ScannerGuide />
      </div>

      {/* Scanner Section */}
      <div className="max-w-3xl mx-auto mb-12">
        <div className="bg-card border-2 rounded-3xl p-6 md:p-8 shadow-xl">
          {!selectedImage && !cameraActive && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  onClick={startCamera}
                  className="h-32 rounded-2xl flex flex-col gap-3 bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                >
                  <Camera className="size-8" />
                  <span className="font-bold">Buka Kamera</span>
                </Button>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="h-32 rounded-2xl flex flex-col gap-3 border-2"
                >
                  <Upload className="size-8" />
                  <span className="font-bold">Upload Foto</span>
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

          {cameraActive && (
            <div className="space-y-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-2xl bg-black"
              />
              <div className="flex gap-3">
                <Button onClick={capturePhoto} className="flex-1 rounded-xl">
                  <Camera className="mr-2 size-5" />
                  Ambil Foto
                </Button>
                <Button onClick={stopCamera} variant="outline" className="rounded-xl">
                  <X className="size-5" />
                </Button>
              </div>
            </div>
          )}

          {selectedImage && !cameraActive && (
            <div className="space-y-4">
              <div className="relative">
                <Image
                  src={selectedImage}
                  alt="Selected"
                  width={800}
                  height={600}
                  className="w-full rounded-2xl"
                />
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setDetectedIngredients([]);
                    setSuggestedRecipes([]);
                    setError("");
                  }}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white hover:bg-black/70"
                >
                  <X className="size-5" />
                </button>
              </div>
              
              {!scanning && detectedIngredients.length === 0 && (
                <Button
                  onClick={handleScan}
                  disabled={!member || (aiStatus && !aiStatus.canUseAI)}
                  className="w-full h-14 rounded-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  <Sparkles className="mr-2 size-5" />
                  Scan & Analisis Bahan
                </Button>
              )}
              
              {scanning && (
                <div className="py-8 flex flex-col items-center gap-4">
                  <Loader2 className="size-12 animate-spin text-purple-600" />
                  <p className="font-semibold animate-pulse">Chef AI sedang menganalisis foto...</p>
                </div>
              )}
              
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* Results */}
      {detectedIngredients.length > 0 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Detected Ingredients */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Utensils className="size-6 text-purple-600" />
              Bahan Terdeteksi
            </h2>
            <div className="flex flex-wrap gap-3">
              {detectedIngredients.map((ing, i) => (
                <div
                  key={i}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-200 font-semibold"
                >
                  {ing.name}
                  <span className="ml-2 text-xs text-purple-600">
                    {Math.round(ing.confidence * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Recipes */}
          {suggestedRecipes.length > 0 ? (
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <ChefHat className="size-6 text-purple-600" />
                Resep yang Disarankan
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suggestedRecipes.map((recipe) => (
                  <div key={recipe._id} className="space-y-3">
                    <div className="relative">
                      <div className="absolute -top-3 -right-3 z-10 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-lg shadow-lg">
                        {recipe.matchScore}% Match
                      </div>
                      <RecipeCard recipe={recipe} />
                    </div>
                    
                    {recipe.estimatedCalories && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-50 border border-orange-200 text-sm">
                        <Flame className="size-4 text-orange-600" />
                        <span className="font-semibold text-orange-900">
                          ~{recipe.estimatedCalories} kkal
                        </span>
                        {recipe.nutritionInfo && (
                          <span className="text-xs text-orange-700">
                            (P: {recipe.nutritionInfo.protein}g, C: {recipe.nutritionInfo.carbs}g, F: {recipe.nutritionInfo.fat}g)
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 text-xs italic text-muted-foreground">
                      &quot;{recipe.reason}&quot;
                    </div>
                    
                    <Button
                      onClick={() => startChatWithRecipe(recipe)}
                      variant="outline"
                      className="w-full rounded-xl border-2 border-purple-200 hover:bg-purple-50"
                    >
                      <MessageSquare className="mr-2 size-4" />
                      Chat dengan Chef AI
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <div className="rounded-3xl border-2 border-dashed border-purple-200 bg-purple-50/50 p-8 text-center space-y-4">
                <div className="text-5xl">🍳</div>
                <h3 className="text-xl font-bold text-foreground">Belum Ada Resep di Database</h3>
                <p className="text-muted-foreground">
                  Bahan-bahan sudah terdeteksi dengan baik, tapi database resep Dapur Ardya masih kosong. 
                  Tambahkan resep terlebih dahulu untuk mendapatkan rekomendasi dari Chef AI.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <Link href="/admin/resep/new">
                    <Button className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600">
                      <ChefHat className="mr-2 size-4" />
                      Tambah Resep
                    </Button>
                  </Link>
                  <Link href="/resep">
                    <Button variant="outline" className="rounded-xl border-2 border-purple-200">
                      Lihat Semua Resep
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Chat Modal */}
      {showChat && selectedRecipeForChat && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
          <div className="bg-background w-full sm:max-w-2xl h-[80vh] sm:h-[600px] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-3xl">
              <div className="flex items-center gap-3">
                <ChefHat className="size-6" />
                <div>
                  <h3 className="font-bold">{selectedRecipeForChat.title}</h3>
                  <p className="text-xs opacity-90">Chat dengan Chef AI</p>
                </div>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="p-2 rounded-full hover:bg-white/20"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted px-4 py-3 rounded-2xl">
                    <Loader2 className="size-5 animate-spin text-purple-600" />
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendChatMessage()}
                  placeholder="Tanya Chef AI..."
                  className="flex-1 px-4 py-3 rounded-2xl border-2 focus:outline-none focus:border-purple-600"
                />
                <Button
                  onClick={sendChatMessage}
                  disabled={!chatInput.trim() || chatLoading}
                  className="rounded-2xl px-6 bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  <Send className="size-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
