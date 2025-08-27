"use client";

import { useAppContext } from "@/contexts/AppContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, ShoppingCart, Info } from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import { Reward } from "@/lib/types";

export default function StorePage() {
  const { state, redeemReward, t } = useAppContext();
  const { wallet, rewards } = state;

  const activeRewards = rewards.filter(r => r.active);

  const handleRedeem = (reward: Reward) => {
    redeemReward(reward);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tighter">{t('store')}</h1>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted">
          <Coins className="h-5 w-5 text-primary"/>
          <span className="font-bold text-lg">{wallet.coins}</span>
        </div>
      </div>
      
      {activeRewards.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <CardHeader>
            <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <CardTitle>{t('theStoreIsEmpty')}</CardTitle>
            <CardDescription>{t('theStoreIsEmptyMessage')}</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activeRewards.map((reward) => (
            <Card key={reward.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{reward.title}</CardTitle>
                <CardDescription className="flex items-start gap-2 pt-2">
                    <Info size={16} className="mt-1 shrink-0"/>
                    <span>{reward.description || t('noDescription')}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow"></CardContent>
              <CardFooter className="flex justify-between items-center">
                <div className="flex items-center gap-2 font-bold text-lg text-primary">
                  <Coins className="h-5 w-5" />
                  <span>{reward.cost}</span>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button disabled={wallet.coins < reward.cost}>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      {t('redeem')}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('confirmRedemption')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('confirmRedemptionMessage', { cost: reward.cost, title: reward.title })}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleRedeem(reward)}>{t('confirm')}</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
