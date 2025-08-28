"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Timer from '@/components/session/Timer'; // Reusing the Timer component
import { PartyPopper, Clock } from 'lucide-react';

export default function RewardSessionPage() {
  const router = useRouter();
  const { state, updateRewardSession, endRewardSession, t, playNotificationSound } = useAppContext();
  const { rewardSession } = state;

  const [timeRemaining, setTimeRemaining] = useState(rewardSession?.duration || 0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!rewardSession) {
      router.replace('/store');
    }
  }, [rewardSession, router]);

  useEffect(() => {
    if (rewardSession) {
      setTimeRemaining(rewardSession.duration - rewardSession.timeElapsed);
    }
  }, [rewardSession]);

  const handleFinish = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    playNotificationSound();
    endRewardSession();
    router.replace('/store');
  }, [endRewardSession, router, playNotificationSound]);

  const handleTick = useCallback(() => {
    setTimeRemaining(prev => {
        if(prev <= 1) {
            handleFinish();
            return 0;
        }
        return prev - 1;
    });
  }, [handleFinish]);

  useEffect(() => {
    if (timeRemaining <= 0) {
      return;
    }

    timerRef.current = setInterval(handleTick, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeRemaining, handleTick]);

  useEffect(() => {
    if (rewardSession) {
        const newTimeElapsed = rewardSession.duration - timeRemaining;
        if (rewardSession.timeElapsed !== newTimeElapsed) {
            updateRewardSession({ timeElapsed: newTimeElapsed });
        }
    }
  }, [timeRemaining, rewardSession, updateRewardSession]);


  if (!rewardSession) {
    return null; // Or a loading spinner
  }

  const progress = rewardSession ? (rewardSession.duration > 0 ? ((rewardSession.duration - timeRemaining) / rewardSession.duration) * 100 : 0) : 0;

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <PartyPopper className="w-16 h-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tighter">{t('rewardInProgress')}</CardTitle>
          <CardDescription>
            {t('enjoyYourReward')}: {rewardSession.reward.title}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-8">
          <Timer
            duration={rewardSession.duration}
            timeRemaining={timeRemaining}
            progress={progress}
            isPaused={false} // Pausing not implemented for rewards
          />
          <Button onClick={handleFinish} size="lg" className="w-full">
            <Clock className="mr-2 h-4 w-4" />
            {t('finishReward')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
