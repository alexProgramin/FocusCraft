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
import { Settings as SettingsIcon, AlertTriangle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Language } from "@/lib/i18n";
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

const formSchema = z.object({
  defaultDuration: z.coerce.number().int().positive(),
  completionThreshold: z.coerce.number().min(0.5).max(0.95),
  rewardAmount: z.coerce.number().int().positive(),
  penaltyAmount: z.coerce.number().int().positive(),
  cooldown: z.coerce.number().int().min(0),
  strictMode: z.boolean(),
  language: z.enum(['en', 'es']),
});

export default function SettingsPage() {
  const { state, updateSettings, checkPin, setPin, t, resetAppData } = useAppContext();
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
      language: state.settings.language,
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
      <h1 className="text-3xl font-bold tracking-tighter">{t('settings')}</h1>
      
      {!isUnlocked && (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
            <CardHeader>
                <SettingsIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <CardTitle>{t('settingsLocked')}</CardTitle>
                <CardDescription>{t('settingsLockedMessage')}</CardDescription>
            </CardHeader>
            <CardContent>
                <PinDialog
                    hasPin={!!state.settings.pin}
                    onPinVerified={handlePinVerified}
                    onPinSet={handlePinSet}
                    checkPin={checkPin}
                    setPin={setPin}
                >
                    <Button>{t('unlockSettings')}</Button>
                </PinDialog>
            </CardContent>
        </Card>
      )}

      {isUnlocked && (
        <>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card>
                  <CardHeader>
                      <CardTitle>{t('sessionSettings')}</CardTitle>
                      <CardDescription>{t('sessionSettingsDescription')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <FormField
                          control={form.control}
                          name="defaultDuration"
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel>{t('defaultDuration')}</FormLabel>
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
                              <FormLabel>{t('completionThreshold')}</FormLabel>
                              <FormControl>
                                  <Input type="number" step="0.05" min="0.5" max="0.95" {...field} />
                              </FormControl>
                              <FormDescription>{t('completionThresholdDescription')}</FormDescription>
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
                                      <FormLabel>{t('strictMode')}</FormLabel>
                                      <FormDescription>
                                          {t('strictModeDescription')}
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
                      <CardTitle>{t('coinEconomy')}</CardTitle>
                      <CardDescription>{t('coinEconomyDescription')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <FormField
                          control={form.control}
                          name="rewardAmount"
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel>{t('rewardPerSession')}</FormLabel>
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
                              <FormLabel>{t('penaltyForAbandoning')}</FormLabel>
                              <FormControl>
                                  <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                              </FormItem>
                          )}
                      />
                  </CardContent>
              </Card>

              <Card>
                  <CardHeader>
                      <CardTitle>{t('language')}</CardTitle>
                      <CardDescription>{t('languageDescription')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <FormField
                          control={form.control}
                          name="language"
                          render={({ field }) => (
                              <FormItem>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                          <SelectTrigger>
                                              <SelectValue placeholder={t('language')} />
                                          </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                          <SelectItem value="en">{t('english')}</SelectItem>
                                          <SelectItem value="es">{t('spanish')}</SelectItem>
                                      </SelectContent>
                                  </Select>
                                  <FormMessage />
                              </FormItem>
                          )}
                      />
                  </CardContent>
              </Card>
              
              <Button type="submit">{t('saveSettings')}</Button>
            </form>
          </Form>
        
          <Card className="border-destructive">
            <CardHeader>
                <CardTitle className="text-destructive">{t('dangerZone')}</CardTitle>
                <CardDescription>{t('dangerZoneDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            {t('deleteAllData')}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>{t('deleteAllDataConfirmationTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('deleteAllDataConfirmationMessage')}
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90"
                            onClick={resetAppData}
                        >
                            {t('reset')}
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
          </Card>

          {!state.settings.pin && <div className="mt-4"><PinDialog hasPin={false} onPinSet={handlePinSet} checkPin={checkPin} setPin={setPin}><Button variant="link">{t('setPinToProtect')}</Button></PinDialog></div>}
        </>
      )}
    </div>
  );
}
