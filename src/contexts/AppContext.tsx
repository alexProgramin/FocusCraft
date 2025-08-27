"use client";

import { AppState, Reward, Settings, Session } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import React, { createContext, useContext, useEffect, useReducer } from "react";

const APP_STORAGE_KEY = "focuscraft.data";

const initialState: AppState = {
  wallet: { coins: 50 },
  rewards: [
    { id: '1', title: '30 min movie time', description: 'Watch any movie for 30 minutes', cost: 25, active: true, createdAt: Date.now() },
    { id: '2', title: '20 min gaming', description: 'Play your favorite game', cost: 20, active: true, createdAt: Date.now() },
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
  },
  session: null,
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
  | { type: "UPDATE_SETTINGS"; payload: Partial<Settings> };

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case "HYDRATE":
      return { ...action.payload, hydrated: true };
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
      const newCoins = state.wallet.coins + state.settings.rewardAmount;
      const newTransaction = {
        id: crypto.randomUUID(),
        type: "session" as const,
        amount: state.settings.rewardAmount,
        date: Date.now(),
        note: `Completed ${state.session.duration / 60} min session`,
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
        const newCoins = Math.max(0, state.wallet.coins - state.settings.penaltyAmount);
        const newTransaction = {
          id: crypto.randomUUID(),
          type: "penalty" as const,
          amount: -state.settings.penaltyAmount,
          date: Date.now(),
          note: `Abandoned ${state.session.duration / 60} min session`,
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
      const newCoins = state.wallet.coins - reward.cost;
      const newTransaction = {
        id: crypto.randomUUID(),
        type: "redeem" as const,
        amount: -reward.cost,
        date: Date.now(),
        note: `Redeemed: ${reward.title}`,
      };
      return {
        ...state,
        wallet: { coins: newCoins },
        transactions: [newTransaction, ...state.transactions],
      };
    }
    case "UPDATE_SETTINGS":
      return { ...state, settings: { ...state.settings, ...action.payload } };
    default:
      return state;
  }
};

interface AppContextType {
  state: AppState;
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { toast } = useToast();

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
    toast({ title: "Session Complete!", description: `You've earned ${state.settings.rewardAmount} coins.`, variant: 'default' });
  };
  const abandonSession = () => {
    dispatch({ type: "ABANDON_SESSION" });
    toast({ title: "Session Abandoned", description: `You've lost ${state.settings.penaltyAmount} coins.`, variant: 'destructive' });
  };
  const addReward = (rewardData: Omit<Reward, 'id' | 'createdAt'>) => {
    const newReward: Reward = { ...rewardData, id: crypto.randomUUID(), createdAt: Date.now() };
    dispatch({ type: "ADD_REWARD", payload: newReward });
    toast({ title: "Reward Added", description: `"${newReward.title}" is now in your store.` });
  };
  const updateReward = (reward: Reward) => {
    dispatch({ type: "UPDATE_REWARD", payload: reward });
     toast({ title: "Reward Updated", description: `"${reward.title}" has been updated.` });
  };
  const deleteReward = (id: string) => {
    dispatch({ type: "DELETE_REWARD", payload: id });
    toast({ title: "Reward Deleted" });
  };
  const redeemReward = (reward: Reward) => {
    if (state.wallet.coins >= reward.cost) {
      dispatch({ type: "REDEEM_REWARD", payload: reward });
      toast({ title: "Reward Redeemed!", description: `You've spent ${reward.cost} coins on "${reward.title}".` });
    } else {
      toast({ title: "Not enough coins!", variant: "destructive" });
    }
  };
  const updateSettings = (settings: Partial<Settings>) => {
    dispatch({ type: "UPDATE_SETTINGS", payload: settings });
    toast({ title: "Settings Updated" });
  };

  const checkPin = (pin: string) => state.settings.pin === pin;
  const setPin = (pin: string) => dispatch({ type: "UPDATE_SETTINGS", payload: { pin }});

  return (
    <AppContext.Provider
      value={{ state, startSession, updateSession, completeSession, abandonSession, addReward, updateReward, deleteReward, redeemReward, updateSettings, checkPin, setPin }}
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
