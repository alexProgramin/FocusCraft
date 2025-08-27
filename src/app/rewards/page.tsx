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
  const { state, deleteReward, updateReward } = useAppContext();
  const { rewards } = state;
  const [editingReward, setEditingReward] = useState<Reward | null>(null);

  const handleToggleActive = (reward: Reward) => {
    updateReward({ ...reward, active: !reward.active });
  };
  
  return (
    <div className="flex flex-col gap-6">
       <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tighter">My Rewards</h1>
        <RewardForm
            reward={editingReward}
            onClose={() => setEditingReward(null)}
        >
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Reward
          </Button>
        </RewardForm>
      </div>

      {rewards.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <CardHeader>
            <Gift className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <CardTitle>No Rewards Yet</CardTitle>
            <CardDescription>Click "Add Reward" to create your first custom reward.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rewards.map((reward) => (
            <Card key={reward.id} className={`flex flex-col ${!reward.active ? 'opacity-60 bg-muted/50' : ''}`}>
              <CardHeader>
                <CardTitle>{reward.title}</CardTitle>
                <CardDescription>{reward.description || "No description."}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex items-center gap-2 font-bold text-lg text-primary">
                    <Coins className="h-5 w-5" />
                    <span>{reward.cost} Coins</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                 <Button variant="ghost" size="icon" onClick={() => handleToggleActive(reward)} aria-label={reward.active ? "Deactivate" : "Activate"}>
                  {reward.active ? <ToggleRight className="h-5 w-5 text-green-500" /> : <ToggleLeft className="h-5 w-5 text-muted-foreground" />}
                </Button>
                 <RewardForm
                    reward={reward}
                    onClose={() => {}}
                    trigger={
                        <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                        </Button>
                    }
                 />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Reward</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{reward.title}"? This will not affect past transactions.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive hover:bg-destructive/90"
                        onClick={() => deleteReward(reward.id)}
                      >
                        Delete
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
