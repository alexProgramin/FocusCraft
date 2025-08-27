"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppContext } from "@/contexts/AppContext";
import { Coins, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { state, startSession } = useAppContext();
  const router = useRouter();
  const [duration, setDuration] = useState(state.settings.defaultDuration);

  const handleStartSession = () => {
    if (state.session) {
      router.push("/session");
      return;
    }
    startSession(duration);
    router.push("/session");
  };

  if (!state.hydrated) {
    return (
       <div className="flex flex-col gap-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">My Coins</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-24" />
          </CardContent>
        </Card>
        <Card className="flex flex-col items-center justify-center p-6 md:p-12">
          <CardHeader className="items-center">
            <Zap className="h-16 w-16 text-primary mb-4" />
            <CardTitle className="text-3xl font-bold tracking-tighter">Start Focusing</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 w-full max-w-sm">
             <Skeleton className="h-10 w-full" />
             <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">My Coins</CardTitle>
          <Coins className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{state.wallet.coins}</div>
          <p className="text-xs text-muted-foreground">Your hard-earned currency</p>
        </CardContent>
      </Card>
      
      <Card className="flex flex-col items-center justify-center p-6 md:p-12">
        <CardHeader className="items-center text-center">
          <Zap className="h-16 w-16 text-primary mb-4" />
          <CardTitle className="text-3xl font-bold tracking-tighter">
            {state.session ? "Session in Progress" : "Start Focusing"}
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            {state.session ? "You can go back to your active session." : "Select a duration and start earning coins."}
          </p>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 w-full max-w-sm">
          {!state.session && (
            <Select onValueChange={(value) => setDuration(Number(value))} defaultValue={String(duration)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {state.settings.sessionDurations.map(d => (
                  <SelectItem key={d} value={String(d)}>{d} minutes</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button size="lg" className="w-full text-lg py-7" onClick={handleStartSession}>
            <Zap className="mr-2 h-5 w-5" />
            {state.session ? "Resume Session" : "Start Session"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
