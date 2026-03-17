"use client";

import { Camera, Lightbulb, Image as ImageIcon, CheckCircle2 } from "lucide-react";

export function ScannerGuide() {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-6 md:p-8 border-2 border-purple-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-2xl bg-purple-600 text-white">
          <Lightbulb className="size-6" />
        </div>
        <h3 className="text-xl font-bold">Tips Foto Terbaik</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-purple-100">
          <div className="p-2 rounded-lg bg-purple-100 text-purple-600 shrink-0">
            <Camera className="size-5" />
          </div>
          <div>
            <h4 className="font-semibold mb-1">Pencahayaan Baik</h4>
            <p className="text-sm text-muted-foreground">
              Pastikan ruangan terang atau gunakan flash agar bahan terlihat jelas
            </p>
          </div>
        </div>
        
        <div className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-purple-100">
          <div className="p-2 rounded-lg bg-purple-100 text-purple-600 shrink-0">
            <ImageIcon className="size-5" />
          </div>
          <div>
            <h4 className="font-semibold mb-1">Fokus & Tidak Blur</h4>
            <p className="text-sm text-muted-foreground">
              Tunggu kamera fokus sebelum ambil foto, hindari foto yang goyang
            </p>
          </div>
        </div>
        
        <div className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-purple-100">
          <div className="p-2 rounded-lg bg-purple-100 text-purple-600 shrink-0">
            <CheckCircle2 className="size-5" />
          </div>
          <div>
            <h4 className="font-semibold mb-1">Bahan Terlihat Jelas</h4>
            <p className="text-sm text-muted-foreground">
              Atur posisi bahan agar tidak tertutup atau terlalu rapat
            </p>
          </div>
        </div>
        
        <div className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-purple-100">
          <div className="p-2 rounded-lg bg-purple-100 text-purple-600 shrink-0">
            <Lightbulb className="size-5" />
          </div>
          <div>
            <h4 className="font-semibold mb-1">Background Kontras</h4>
            <p className="text-sm text-muted-foreground">
              Gunakan background yang berbeda warna dengan bahan makanan
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-white rounded-2xl border-2 border-purple-200">
        <p className="text-sm text-center text-muted-foreground">
          <span className="font-semibold text-purple-600">Pro Tip:</span> Foto dari atas (bird&apos;s eye view) 
          biasanya memberikan hasil deteksi terbaik!
        </p>
      </div>
    </div>
  );
}
