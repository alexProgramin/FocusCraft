"use client";

import { useAppContext } from "@/contexts/AppContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Coins, ToggleLeft, ToggleRight, Gift } from "lucide-react";
import RewardForm from "@/components/rewards/RewardForm";
import { Reward } from "@/lib/types";
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
import { useState } from "react";

export default function RewardsPage() {
  const { state, deleteReward, updateReward, t } = useAppContext();
  const { rewards } = state;
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);


  const handleToggleActive = (reward: Reward) => {
    updateReward({ ...reward, active: !reward.active });
  };
  
  const handleEdit = (reward: Reward) => {
    setEditingReward(reward);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingReward(null);
    setIsFormOpen(true);
  }
  
  const handleCloseForm = () => {
    setIsFormOpen(false);
    // Give a bit of time for the close animation to finish before resetting the reward
    setTimeout(() => {
        setEditingReward(null);
    }, 150)
  };

  return (
    <div className="flex flex-col gap-6">
       <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tighter">{t('myRewards')}</h1>
        <RewardForm
            isOpen={isFormOpen}
            onOpenChange={setIsFormOpen}
            reward={editingReward}
            onClose={handleCloseForm}
        >
          <Button onClick={handleAddNew}>
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden md:inline">{t('addReward')}</span>
            <span className="inline md:hidden">{t('addReward')}</span>
          </Button>
        </RewardForm>
      </div>

      {rewards.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <CardHeader>
            <Gift className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <CardTitle>{t('noRewardsYet')}</CardTitle>
            <CardDescription>{t('noRewardsYetMessage')}</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {rewards.map((reward) => (
            <Card key={reward.id} className={`flex flex-col ${!reward.active ? 'opacity-60 bg-muted/50' : ''}`}>
              <CardHeader>
                <CardTitle>{reward.title}</CardTitle>
                <CardDescription>{reward.description || t('noDescription')}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex items-center gap-2 font-bold text-lg text-primary">
                    <Coins className="h-5 w-5" />
                    <span>{reward.cost} {t('coins')}</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                 <Button variant="ghost" size="icon" onClick={() => handleToggleActive(reward)} aria-label={reward.active ? t('deactivate') : t('activate')}>
                  {reward.active ? <ToggleRight className="h-5 w-5 text-green-500" /> : <ToggleLeft className="h-5 w-5 text-muted-foreground" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleEdit(reward)}>
                    <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('deleteReward')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('deleteRewardConfirmation', {title: reward.title})}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive hover:bg-destructive/90"
                        onClick={() => deleteReward(reward.id)}
                      >
                        {t('delete')}
                      </AlertDialogAction>
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
