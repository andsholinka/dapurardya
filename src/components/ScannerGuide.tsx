"use client";

import { Lightbulb } from "lucide-react";

export function ScannerGuide() {
  return (
    <div className="bg-gradient-to-br from-secondary to-accent/30 rounded-2xl p-4 md:p-5 border border-primary/20">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-primary text-white shrink-0">
          <Lightbulb className="size-4" />
        </div>
        <div className="flex-1 space-y-2">
          <h3 className="text-sm font-bold text-foreground">Tips Foto Terbaik</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Pencahayaan terang & tidak blur</li>
            <li>• Bahan terlihat jelas, tidak tertutup</li>
            <li>• Background kontras dengan bahan</li>
            <li>• Foto dari atas (bird&apos;s eye view) lebih baik</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
