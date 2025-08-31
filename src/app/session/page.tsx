"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import Timer from '@/components/session/Timer';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { MotivationalMessageInput } from '@/ai/flows/motivational-messages';

export default function SessionPage() {
  const router = useRouter();
  const { state, updateSession, completeSession, abandonSession, t, playNotificationSound } = useAppContext();
  const { session, settings } = state;
  const { toast } = useToast();

  const [timeRemaining, setTimeRemaining] = useState(session?.duration || 0);
  const [motivationalMessage, setMotivationalMessage] = useState(t('letsGetStarted'));
  const [isPaused, setIsPaused] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const messageTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pauseRef = useRef<NodeJS.Timeout | null>(null);

  // Effect to handle navigation and session status checks
  useEffect(() => {
    if (!session || session.status !== 'active') {
      router.replace('/');
    }
  }, [session, router]);
  
  // Effect to initialize or sync timeRemaining when session changes
  useEffect(() => {
    if (session) {
      const remaining = session.duration - session.timeElapsed;
      setTimeRemaining(remaining > 0 ? remaining : 0);
    }
  }, [session]);

  const handleComplete = useCallback(() => {
    playNotificationSound();
    completeSession();
    router.replace('/');
  }, [completeSession, router, playNotificationSound]);

  const handleTick = useCallback(() => {
    setTimeRemaining(prev => prev - 1);
  }, []);

  // Effect for the main timer logic
  useEffect(() => {
    if (isPaused || !session || (timeRemaining === 0 && session.timeElapsed === 0 && session.duration > 0)) {
        return;
    }

    if (timeRemaining <= 0) {
      handleComplete();
      return;
    }

    timerRef.current = setInterval(handleTick, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeRemaining, isPaused, session, handleTick, handleComplete]);

  // Effect to update the global session state with elapsed time
  useEffect(() => {
    if (session && !isPaused) {
        const newTimeElapsed = session.duration - timeRemaining;
        if (session.timeElapsed !== newTimeElapsed && newTimeElapsed > 0) {
            updateSession({ timeElapsed: newTimeElapsed });
        }
    }
  }, [timeRemaining, session, updateSession, isPaused]);


  // Effect for fetching motivational messages
  useEffect(() => {
    const getMessage = async () => {
      if (!session) return;
      const progress = (session.timeElapsed / session.duration) * 100;
      
      try {
        // IMPORTANT: Replace with your deployed Genkit backend URL
        const response = await fetch('https://tu-backend-de-genkit.com/api/motivational-message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionProgress: progress,
            timeRemaining: timeRemaining,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch motivational message');
        }

        const data = await response.json();
        setMotivationalMessage(data.message);
      } catch (error) {
        console.error(error);
        // Fallback message
        setMotivationalMessage("You're doing great, keep it up!");
      }
    };

    if (session && session.status === 'active' && !isPaused) {
      getMessage(); // initial message
      messageTimerRef.current = setInterval(getMessage, 30000); // every 30 seconds
    }

    return () => {
      if (messageTimerRef.current) clearInterval(messageTimerRef.current);
    };
  }, [session, timeRemaining, isPaused]);

  // Effect for strict mode visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!settings.strictMode || !session) return;
      if (document.visibilityState === 'hidden') {
        setIsPaused(true);
        if (timerRef.current) clearInterval(timerRef.current);

        toast({
            title: t('sessionPausedToastTitle'),
            description: t('sessionPausedToastDescription'),
            variant: "destructive"
        })

        pauseRef.current = setTimeout(() => {
            abandonSession();
            router.replace("/");
        }, 5000); // 5 second grace period
      } else {
        if(pauseRef.current) clearTimeout(pauseRef.current);
        setIsPaused(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (timerRef.current) clearInterval(timerRef.current);
      if (messageTimerRef.current) clearInterval(messageTimerRef.current);
      if(pauseRef.current) clearTimeout(pauseRef.current);
    };
  }, [settings.strictMode, session, abandonSession, router, toast, t]);


  if (!session) {
    return null; // or a loading spinner
  }
  
  const handleAbandon = () => {
    abandonSession();
    router.replace('/');
  };

  const progress = session ? (session.duration > 0 ? ((session.duration - timeRemaining) / session.duration) * 100 : 0) : 0;

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tighter">{t('stayFocused')}</CardTitle>
          <CardDescription className="min-h-[40px] flex items-center justify-center">
            {isPaused ? t('sessionPaused') : motivationalMessage}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-8">
          <Timer
            duration={session.duration}
            timeRemaining={timeRemaining}
            progress={progress}
            isPaused={isPaused}
          />

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="lg" className="w-full">
                <AlertTriangle className="mr-2 h-4 w-4" />
                {t('abandonSession')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('abandonSessionConfirmationTitle')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('abandonSessionConfirmationMessage', { penaltyAmount: settings.penaltyAmount })}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('keepFocusing')}</AlertDialogCancel>
                <AlertDialogAction onClick={handleAbandon}>{t('abandon')}</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
        </CardContent>
      </Card>
    </div>
  );
}
