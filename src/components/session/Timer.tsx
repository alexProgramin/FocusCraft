"use client";

import { useAppContext } from "@/contexts/AppContext";

interface TimerProps {
  duration: number;
  timeRemaining: number;
  progress: number;
  isPaused: boolean;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export default function Timer({ duration, timeRemaining, progress, isPaused }: TimerProps) {
  const { t } = useAppContext();
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-64 h-64">
      <svg className="w-full h-full" viewBox="0 0 200 200">
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="12"
        />
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 100 100)"
          className="transition-all duration-1000 ease-linear"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold tabular-nums tracking-tighter">
          {formatTime(timeRemaining)}
        </span>
        <span className="text-sm text-muted-foreground mt-1">
          {isPaused ? t('paused') : t('timeRemaining')}
        </span>
      </div>
    </div>
  );
}
