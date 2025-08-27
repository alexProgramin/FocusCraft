"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import Timer from '@/components/session/Timer';
import { fetchMotivationalMessage } from './actions';
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

export default function SessionPage() {
  const router = useRouter();
  const { state, updateSession, completeSession, abandonSession, t } = useAppContext();
  const { session, settings } = state;
  const { toast } = useToast();

  const [timeRemaining, setTimeRemaining] = useState(session?.duration || 0);
  const [motivationalMessage, setMotivationalMessage] = useState(t('letsGetStarted'));
  const [isPaused, setIsPaused] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const messageTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pauseRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!session) {
      router.replace('/');
      return;
    }

    if (session.status !== 'active') {
      // If session is already completed or abandoned, redirect
      router.replace('/');
    }

    setTimeRemaining(session.duration - session.timeElapsed);

  }, [session, router]);
  
  const handleTick = () => {
    setTimeRemaining(prev => {
        const newTime = prev - 1;
        if (session) {
            updateSession({timeElapsed: session.duration - newTime});
        }
        if (newTime <= 0) {
          clearInterval(timerRef.current!);
          completeSession();
          router.replace('/');
        }
        return newTime;
      });
  }

  useEffect(() => {
    if (session && session.status === 'active' && !isPaused) {
      timerRef.current = setInterval(handleTick, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [session, isPaused]);

  useEffect(() => {
    const getMessage = async () => {
      if (!session) return;
      const progress = (session.timeElapsed / session.duration) * 100;
      const message = await fetchMotivationalMessage({
        sessionProgress: progress,
        timeRemaining: timeRemaining,
      });
      setMotivationalMessage(message);
    };

    if (session && session.status === 'active' && !isPaused) {
      getMessage(); // initial message
      messageTimerRef.current = setInterval(getMessage, 30000); // every 30 seconds
    }

    return () => {
      if (messageTimerRef.current) clearInterval(messageTimerRef.current);
    };
  }, [session, timeRemaining, isPaused]);

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

  const progress = (session.timeElapsed / session.duration) * 100;

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
