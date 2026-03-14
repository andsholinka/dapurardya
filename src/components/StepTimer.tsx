"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Timer as TimerIcon, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StepTimerProps {
  minutes: number;
}

export function StepTimer({ minutes }: StepTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(minutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [muted, setMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((s) => s - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsActive(false);
      setIsFinished(true);
      if (!muted) {
        playAlarm();
      }
    }

    return () => clearInterval(interval);
  }, [isActive, secondsLeft, muted]);

  function playAlarm() {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1);
    } catch (e) {
      console.error("Failed to play alarm sound", e);
    }
  }

  function toggle() {
    if (isFinished) {
      reset();
    } else {
      setIsActive(!isActive);
    }
  }

  function reset() {
    setIsActive(false);
    setSecondsLeft(minutes * 60);
    setIsFinished(false);
  }

  const displayMins = Math.floor(secondsLeft / 60);
  const displaySecs = secondsLeft % 60;

  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 transition-all my-1",
      isFinished 
        ? "bg-amber-500 border-amber-600 text-white animate-pulse" 
        : isActive 
          ? "bg-primary/10 border-primary text-primary" 
          : "bg-muted/50 border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
    )}>
      <TimerIcon className={cn("size-4", isActive && "animate-spin-slow")} />
      
      <span className="font-mono font-medium text-sm tabular-nums">
        {displayMins}:{displaySecs.toString().padStart(2, "0")}
      </span>

      <div className="flex items-center gap-1 ml-1 border-l pl-2 border-current/20">
        <button 
          onClick={toggle} 
          className="hover:scale-110 transition-transform focus:outline-none"
        >
          {isActive ? <Pause className="size-4 fill-current" /> : <Play className="size-4 fill-current" />}
        </button>
        <button 
          onClick={reset} 
          className="hover:rotate-[-45deg] transition-transform focus:outline-none"
        >
          <RotateCcw className="size-4" />
        </button>
      </div>
    </div>
  );
}
