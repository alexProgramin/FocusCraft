"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAppContext } from "@/contexts/AppContext";
import type { Reward } from "@/lib/types";
import { ReactNode, useState, useEffect } from "react";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z.string().optional(),
  cost: z.coerce.number().int().positive("Cost must be a positive number."),
});

type RewardFormProps = {
  reward?: Reward | null;
  children?: ReactNode;
  trigger?: ReactNode;
  onClose: () => void;
};

export default function RewardForm({ reward, children, trigger, onClose }: RewardFormProps) {
  const { addReward, updateReward, t } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      cost: 10,
    },
  });
  
  useEffect(() => {
    if (reward) {
      form.reset({
        title: reward.title,
        description: reward.description,
        cost: reward.cost,
      });
      setIsOpen(true);
    } else {
        form.reset({
            title: "",
            description: "",
            cost: 10,
        });
    }
  }, [reward, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (reward) {
      updateReward({ ...reward, ...values });
    } else {
      addReward({ ...values, active: true });
    }
    form.reset();
    setIsOpen(false);
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
      onClose();
    }
    setIsOpen(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{reward ? t('editReward') : t('addNewReward')}</DialogTitle>
          <DialogDescription>
            {reward ? t('updateRewardDetails') : t('createNewReward')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('title')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('titlePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('descriptionOptional')}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t('descriptionPlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('costInCoins')}</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="25" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline">{t('cancel')}</Button>
                </DialogClose>
                <Button type="submit">{reward ? t('saveChanges') : t('addReward')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
