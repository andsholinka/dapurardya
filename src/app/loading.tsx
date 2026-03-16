import { ChefHat } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-4 py-20 animate-in fade-in duration-500">
      <div className="relative flex items-center justify-center">
        <div className="size-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <div className="absolute size-9 rounded-full bg-background flex items-center justify-center">
          <ChefHat className="size-5 text-primary" />
        </div>
      </div>
      <div className="text-center space-y-2">
        <p className="text-xl font-bold text-foreground">Dapur Ardya</p>
        <p className="text-sm text-muted-foreground animate-pulse">Menyiapkan inspirasi masakan untukmu...</p>
      </div>
    </div>
  );
}
