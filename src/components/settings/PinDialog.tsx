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

interface PinDialogProps {
  hasPin: boolean;
  onPinVerified: () => void;
  onPinSet: () => void;
  checkPin: (pin: string) => boolean;
  setPin: (pin: string) => void;
  children: ReactNode;
}

export default function PinDialog({ hasPin, onPinVerified, onPinSet, checkPin, setPin, children }: PinDialogProps) {
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
      toast({ title: "Settings Unlocked" });
    } else {
      setError("Incorrect PIN. Please try again.");
    }
  };

  const handleSet = () => {
    if (pin.length < 4) {
      setError("PIN must be at least 4 digits.");
      return;
    }
    if (pin !== confirmPin) {
      setError("PINs do not match.");
      return;
    }
    setPin(pin);
    onPinSet();
    setIsOpen(false);
    resetState();
    toast({ title: "PIN has been set successfully." });
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
          <DialogTitle>{hasPin ? "Enter PIN" : "Set a New PIN"}</DialogTitle>
          <DialogDescription>
            {hasPin ? "Enter your PIN to access settings." : "Create a 4-digit PIN to protect your settings."}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <Input
            type="password"
            placeholder="PIN"
            value={pin}
            onChange={(e) => setPinValue(e.target.value)}
            maxLength={4}
          />
          {!hasPin && (
            <Input
              type="password"
              placeholder="Confirm PIN"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              maxLength={4}
            />
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
          <Button onClick={hasPin ? handleVerify : handleSet}>
            {hasPin ? "Unlock" : "Set PIN"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
