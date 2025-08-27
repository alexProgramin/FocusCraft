"use client";

import { useAppContext } from "@/contexts/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpCircle, ArrowDownCircle, ShoppingCart, History as HistoryIcon, Coins } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const transactionIcons = {
  session: <ArrowUpCircle className="h-6 w-6 text-green-500" />,
  penalty: <ArrowDownCircle className="h-6 w-6 text-red-500" />,
  redeem: <ShoppingCart className="h-6 w-6 text-blue-500" />,
};

const transactionColors = {
    session: 'text-green-500',
    penalty: 'text-red-500',
    redeem: 'text-blue-500'
};

export default function HistoryPage() {
  const { state } = useAppContext();
  const { transactions } = state;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tighter">Transaction History</h1>
      
      {transactions.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
            <CardHeader>
                <HistoryIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <CardTitle>No History Yet</CardTitle>
                <CardDescription>Complete a session or redeem a reward to see your history.</CardDescription>
            </CardHeader>
        </Card>
      ) : (
        <Card>
            <CardContent className="p-0">
                <ul className="divide-y">
                    {transactions.map(tx => (
                        <li key={tx.id} className="flex items-center gap-4 p-4 hover:bg-muted/50">
                            <div className="p-2 bg-muted rounded-full">
                                {transactionIcons[tx.type]}
                            </div>
                            <div className="flex-grow">
                                <p className="font-semibold">{tx.note}</p>
                                <p className="text-sm text-muted-foreground">
                                    {formatDistanceToNow(new Date(tx.date), { addSuffix: true })}
                                </p>
                            </div>
                            <div className={`flex items-center gap-1 font-bold text-lg ${transactionColors[tx.type]}`}>
                               <span>{tx.amount > 0 ? `+${tx.amount}` : tx.amount}</span>
                               <Coins className="h-4 w-4" />
                            </div>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
