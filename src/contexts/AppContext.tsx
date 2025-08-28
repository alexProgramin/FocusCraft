"use client";

import { AppState, Reward, Settings, Session, RewardSession } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import React, { createContext, useContext, useEffect, useReducer } from "react";
import { getTranslator, Language, translations } from "@/lib/i18n";

const APP_STORAGE_KEY = "focuscraft.data";

const initialState: AppState = {
  wallet: { coins: 50 },
  rewards: [
    { id: '1', title: '30 min movie time', description: 'Watch any movie for 30 minutes', cost: 25, duration: 30, active: true, createdAt: Date.now() },
    { id: '2', title: '20 min gaming', description: 'Play your favorite game', cost: 20, duration: 20, active: true, createdAt: Date.now() },
  ],
  transactions: [],
  settings: {
    sessionDurations: [15, 25, 45, 60],
    defaultDuration: 25,
    completionThreshold: 0.8,
    rewardAmount: 10,
    penaltyAmount: 5,
    cooldown: 120,
    strictMode: true,
    language: 'en',
  },
  session: null,
  rewardSession: null,
  hydrated: false,
};

type Action =
  | { type: "HYDRATE"; payload: AppState }
  | { type: "START_SESSION"; payload: number }
  | { type: "UPDATE_SESSION"; payload: Partial<Session> }
  | { type: "COMPLETE_SESSION" }
  | { type: "ABANDON_SESSION" }
  | { type: "ADD_REWARD"; payload: Reward }
  | { type: "UPDATE_REWARD"; payload: Reward }
  | { type: "DELETE_REWARD"; payload: string }
  | { type: "REDEEM_REWARD"; payload: Reward }
  | { type: "UPDATE_SETTINGS"; payload: Partial<Settings> }
  | { type: "RESET_APP_DATA" }
  | { type: "START_REWARD_SESSION", payload: Reward }
  | { type: "UPDATE_REWARD_SESSION", payload: Partial<RewardSession> }
  | { type: "END_REWARD_SESSION" };

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case "HYDRATE":
        const payload = action.payload;
        // Ensure language is set, default to 'en' if not present
        if (!payload.settings.language) {
            payload.settings.language = 'en';
        }
        // Migrate old rewards without descriptions or duration
        payload.rewards = payload.rewards.map(r => ({...r, description: r.description || '', duration: r.duration || 0}))
        return { ...payload, hydrated: true, rewardSession: null }; // Never hydrate a reward session
    case "START_SESSION":
      return {
        ...state,
        session: {
          id: crypto.randomUUID(),
          startTime: Date.now(),
          duration: action.payload * 60,
          status: "active",
          timeElapsed: 0,
        },
      };
    case "UPDATE_SESSION":
        if (!state.session) return state;
        return {
            ...state,
            session: { ...state.session, ...action.payload }
        }
    case "COMPLETE_SESSION": {
      if (!state.session) return state;
      const t = getTranslator(state.settings.language);
      const newCoins = state.wallet.coins + state.settings.rewardAmount;
      const newTransaction = {
        id: crypto.randomUUID(),
        type: "session" as const,
        amount: state.settings.rewardAmount,
        date: Date.now(),
        note: t('completedSessionNote', { duration: state.session.duration / 60 }),
      };
      return {
        ...state,
        wallet: { coins: newCoins },
        transactions: [newTransaction, ...state.transactions],
        session: null,
      };
    }
    case "ABANDON_SESSION": {
        if (!state.session) return state;
        const t = getTranslator(state.settings.language);
        const newCoins = Math.max(0, state.wallet.coins - state.settings.penaltyAmount);
        const newTransaction = {
          id: crypto.randomUUID(),
          type: "penalty" as const,
          amount: -state.settings.penaltyAmount,
          date: Date.now(),
          note: t('abandonedSessionNote', { duration: state.session.duration / 60 }),
        };
        return {
          ...state,
          wallet: { coins: newCoins },
          transactions: [newTransaction, ...state.transactions],
          session: null,
        };
    }
    case "ADD_REWARD":
      return { ...state, rewards: [...state.rewards, action.payload] };
    case "UPDATE_REWARD":
      return {
        ...state,
        rewards: state.rewards.map((r) => (r.id === action.payload.id ? action.payload : r)),
      };
    case "DELETE_REWARD":
      return {
        ...state,
        rewards: state.rewards.filter((r) => r.id !== action.payload),
      };
    case "REDEEM_REWARD": {
      const reward = action.payload;
      if (state.wallet.coins < reward.cost) return state;
      const t = getTranslator(state.settings.language);
      const newCoins = state.wallet.coins - reward.cost;
      const newTransaction = {
        id: crypto.randomUUID(),
        type: "redeem" as const,
        amount: -reward.cost,
        date: Date.now(),
        note: t('redeemedNote', { title: reward.title }),
      };
      return {
        ...state,
        wallet: { coins: newCoins },
        transactions: [newTransaction, ...state.transactions],
      };
    }
    case "START_REWARD_SESSION":
        return {
            ...state,
            rewardSession: {
                id: crypto.randomUUID(),
                reward: action.payload,
                startTime: Date.now(),
                duration: action.payload.duration * 60, // minutes to seconds
                timeElapsed: 0,
            }
        }
    case "UPDATE_REWARD_SESSION":
        if(!state.rewardSession) return state;
        return {
            ...state,
            rewardSession: { ...state.rewardSession, ...action.payload }
        }
    case "END_REWARD_SESSION":
        return { ...state, rewardSession: null };
    case "UPDATE_SETTINGS":
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case "RESET_APP_DATA":
      return { ...initialState, hydrated: true };
    default:
      return state;
  }
};

interface AppContextType {
  state: AppState;
  t: (key: keyof (typeof translations)["en"], vars?: Record<string, string | number>) => string;
  startSession: (duration: number) => void;
  updateSession: (data: Partial<Session>) => void;
  completeSession: () => void;
  abandonSession: () => void;
  addReward: (reward: Omit<Reward, 'id' | 'createdAt'>) => void;
  updateReward: (reward: Reward) => void;
  deleteReward: (id: string) => void;
  redeemReward: (reward: Reward) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  checkPin: (pin: string) => boolean;
  setPin: (pin: string) => void;
  resetAppData: () => void;
  startRewardSession: (reward: Reward) => void;
  updateRewardSession: (data: Partial<RewardSession>) => void;
  endRewardSession: () => void;
  playNotificationSound: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { toast } = useToast();
  const t = getTranslator(state.settings.language);

  // Sound generation logic
  let audioContext: AudioContext | null = null;
  const playNotificationSound = () => {
    if (!audioContext) {
        if (typeof window !== 'undefined' && window.AudioContext) {
            audioContext = new window.AudioContext();
        }
    }
    if (audioContext) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5 note
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);

        gainNode.gain.exponentialRampToValueAtTime(0.001, audio-Context.currentTime + 0.5);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }
  }

  useEffect(() => {
    try {
      const storedState = localStorage.getItem(APP_STORAGE_KEY);
      if (storedState) {
        dispatch({ type: "HYDRATE", payload: JSON.parse(storedState) });
      } else {
        dispatch({ type: "HYDRATE", payload: initialState });
      }
    } catch (error) {
        console.error("Failed to load state from localStorage", error);
        dispatch({ type: "HYDRATE", payload: initialState });
    }
  }, []);

  useEffect(() => {
    if (state.hydrated) {
      const stateToSave = { ...state, hydrated: false };
      localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(stateToSave));
    }
  }, [state]);

  const startSession = (duration: number) => dispatch({ type: "START_SESSION", payload: duration });
  const updateSession = (data: Partial<Session>) => dispatch({ type: "UPDATE_SESSION", payload: data });
  const completeSession = () => {
    dispatch({ type: "COMPLETE_SESSION" });
    toast({ title: t('sessionComplete'), description: t('sessionCompleteMessage', {rewardAmount: state.settings.rewardAmount}), variant: 'default' });
  };
  const abandonSession = () => {
    dispatch({ type: "ABANDON_SESSION" });
    toast({ title: t('sessionAbandoned'), description: t('sessionAbandonedMessage', {penaltyAmount: state.settings.penaltyAmount}), variant: 'destructive' });
  };
  const addReward = (rewardData: Omit<Reward, 'id' | 'createdAt'>) => {
    const newReward: Reward = { ...rewardData, id: crypto.randomUUID(), createdAt: Date.now() };
    dispatch({ type: "ADD_REWARD", payload: newReward });
    toast({ title: t('rewardAdded'), description: t('rewardAddedMessage', {title: newReward.title}) });
  };
  const updateReward = (reward: Reward) => {
    dispatch({ type: "UPDATE_REWARD", payload: reward });
     toast({ title: t('rewardUpdated'), description: t('rewardUpdatedMessage', {title: reward.title}) });
  };
  const deleteReward = (id: string) => {
    dispatch({ type: "DELETE_REWARD", payload: id });
    toast({ title: t('rewardDeleted') });
  };
  const redeemReward = (reward: Reward) => {
    if (state.wallet.coins >= reward.cost) {
      dispatch({ type: "REDEEM_REWARD", payload: reward });
      toast({ title: t('rewardRedeemed'), description: t('rewardRedeemedMessage', {cost: reward.cost, title: reward.title}) });
      if (reward.duration > 0) {
        startRewardSession(reward);
      }
    } else {
      toast({ title: t('notEnoughCoins'), variant: "destructive" });
    }
  };
  const updateSettings = (settings: Partial<Settings>) => {
    dispatch({ type: "UPDATE_SETTINGS", payload: settings });
    toast({ title: t('settingsUpdated') });
  };

  const checkPin = (pin: string) => state.settings.pin === pin;
  const setPin = (pin: string) => dispatch({ type: "UPDATE_SETTINGS", payload: { pin }});

  const resetAppData = () => {
    dispatch({ type: "RESET_APP_DATA" });
    localStorage.removeItem(APP_STORAGE_KEY);
    toast({ title: t('dataReset') });
  }

  const startRewardSession = (reward: Reward) => dispatch({type: "START_REWARD_SESSION", payload: reward});
  const updateRewardSession = (data: Partial<RewardSession>) => dispatch({type: "UPDATE_REWARD_SESSION", payload: data });
  const endRewardSession = () => dispatch({type: "END_REWARD_SESSION"});

  return (
    <AppContext.Provider
      value={{ state, t, startSession, updateSession, completeSession, abandonSession, addReward, updateReward, deleteReward, redeemReward, updateSettings, checkPin, setPin, resetAppData, startRewardSession, updateRewardSession, endRewardSession, playNotificationSound }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
