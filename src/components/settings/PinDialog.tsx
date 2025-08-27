"use client";

import { useState, ReactNode } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { useAppContext } from '@/contexts/AppContext';

interface PinDialogProps {
  hasPin: boolean;
  onPinVerified: () => void;
  onPinSet: () => void;
  checkPin: (pin: string) => boolean;
  setPin: (pin: string) => void;
  children: ReactNode;
}

export default function PinDialog({ hasPin, onPinVerified, onPinSet, checkPin, setPin, children }: PinDialogProps) {
  const { t } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [pin, setPinValue] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleVerify = () => {
    if (checkPin(pin)) {
      onPinVerified();
      setIsOpen(false);
      resetState();
      toast({ title: t('settingsUnlocked') });
    } else {
      setError(t('incorrectPin'));
    }
  };

  const handleSet = () => {
    if (pin.length < 4) {
      setError(t('pinLengthError'));
      return;
    }
    if (pin !== confirmPin) {
      setError(t('pinMismatchError'));
      return;
    }
    setPin(pin);
    onPinSet();
    setIsOpen(false);
    resetState();
    toast({ title: t('pinSetSuccessfully') });
  };
  
  const resetState = () => {
      setPinValue('');
      setConfirmPin('');
      setError('');
  }

  const handleOpenChange = (open: boolean) => {
    if(!open) resetState();
    setIsOpen(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{hasPin ? t('enterPin') : t('setNewPin')}</DialogTitle>
          <DialogDescription>
            {hasPin ? t('enterPinToAccess') : t('createPinToProtect')}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <Input
            type="password"
            placeholder={t('pin')}
            value={pin}
            onChange={(e) => setPinValue(e.target.value)}
            maxLength={4}
          />
          {!hasPin && (
            <Input
              type="password"
              placeholder={t('confirmPin')}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              maxLength={4}
            />
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">{t('cancel')}</Button></DialogClose>
          <Button onClick={hasPin ? handleVerify : handleSet}>
            {hasPin ? t('unlock') : t('setPin')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
