"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import PinDialog from "@/components/settings/PinDialog";
import { Settings } from "lucide-react";

const formSchema = z.object({
  defaultDuration: z.coerce.number().int().positive(),
  completionThreshold: z.coerce.number().min(0.5).max(0.95),
  rewardAmount: z.coerce.number().int().positive(),
  penaltyAmount: z.coerce.number().int().positive(),
  cooldown: z.coerce.number().int().min(0),
  strictMode: z.boolean(),
});

export default function SettingsPage() {
  const { state, updateSettings, checkPin, setPin } = useAppContext();
  const [isUnlocked, setIsUnlocked] = useState(!state.settings.pin);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      defaultDuration: state.settings.defaultDuration,
      completionThreshold: state.settings.completionThreshold,
      rewardAmount: state.settings.rewardAmount,
      penaltyAmount: state.settings.penaltyAmount,
      cooldown: state.settings.cooldown,
      strictMode: state.settings.strictMode,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updateSettings(values);
  };
  
  const handlePinVerified = () => {
    setIsUnlocked(true);
  }
  
  const handlePinSet = () => {
    setIsUnlocked(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tighter">Settings</h1>
      
      {!isUnlocked && (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
            <CardHeader>
                <Settings className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <CardTitle>Settings Locked</CardTitle>
                <CardDescription>Enter your PIN to manage application settings.</CardDescription>
            </CardHeader>
            <CardContent>
                <PinDialog
                    hasPin={!!state.settings.pin}
                    onPinVerified={handlePinVerified}
                    onPinSet={handlePinSet}
                    checkPin={checkPin}
                    setPin={setPin}
                >
                    <Button>Unlock Settings</Button>
                </PinDialog>
            </CardContent>
        </Card>
      )}

      {isUnlocked && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Session Settings</CardTitle>
                    <CardDescription>Configure how focus sessions work.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <FormField
                        control={form.control}
                        name="defaultDuration"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Default Duration (minutes)</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="completionThreshold"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Completion Threshold</FormLabel>
                            <FormControl>
                                <Input type="number" step="0.05" min="0.5" max="0.95" {...field} />
                            </FormControl>
                            <FormDescription>Percentage of session to complete to get reward (e.g., 0.8 for 80%).</FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="strictMode"
                        render={({ field }) => (
                             <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                    <FormLabel>Strict Mode</FormLabel>
                                    <FormDescription>
                                        Penalize automatically if you leave the app.
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Coin Economy</CardTitle>
                    <CardDescription>Adjust the rewards and penalties for sessions.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField
                        control={form.control}
                        name="rewardAmount"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Reward per Session</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="penaltyAmount"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Penalty for Abandoning</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>
            
            <Button type="submit">Save Settings</Button>
          </form>
        </Form>
      )}
       {isUnlocked && !state.settings.pin && <div className="mt-4"><PinDialog hasPin={false} onPinSet={handlePinSet} checkPin={checkPin} setPin={setPin}><Button variant="link">Set a PIN to protect settings</Button></PinDialog></div>}
    </div>
  );
}
