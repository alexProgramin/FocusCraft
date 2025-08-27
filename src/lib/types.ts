export interface Wallet {
  coins: number;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  cost: number;
  active: boolean;
  createdAt: number;
}

export type TransactionType = 'session' | 'penalty' | 'redeem';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: number;
  note: string;
}

export interface Settings {
  sessionDurations: number[]; // in minutes
  defaultDuration: number; // in minutes
  completionThreshold: number; // 0-1
  rewardAmount: number;
  penaltyAmount: number;
  cooldown: number; // in seconds
  strictMode: boolean;
  pin?: string;
  language: 'en' | 'es';
}

export type SessionStatus = 'active' | 'paused' | 'completed' | 'abandoned';

export interface Session {
  id: string;
  startTime: number;
  duration: number; // in seconds
  status: SessionStatus;
  timeElapsed: number; // in seconds
}

export interface AppState {
  wallet: Wallet;
  rewards: Reward[];
  transactions: Transaction[];
  settings: Settings;
  session: Session | null;
  hydrated: boolean;
}
