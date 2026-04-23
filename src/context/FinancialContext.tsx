import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { UserProfile, FinancialInsight, FIREProjection, HealthScore } from '../types';
import { DEFAULT_PROFILE } from '../data/sampleData';
import {
  calculateHealthScore,
  calculateFIREProjection,
  generateInsights,
  getMonthlySavings,
  getSavingsRate,
  getTotalMonthlySpending,
  getFIRENumber,
} from '../engine/financialEngine';

const STORAGE_KEY = 'fintel-profile-v1';

function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as UserProfile;
  } catch {
    /* ignore */
  }
  return DEFAULT_PROFILE;
}

interface FinancialContextType {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  healthScore: HealthScore;
  fireProjection: FIREProjection;
  insights: FinancialInsight[];
  monthlySavings: number;
  savingsRate: number;
  totalSpending: number;
  fireNumber: number;
}

const FinancialContext = createContext<FinancialContextType | null>(null);

export function FinancialProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(loadProfile);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      /* ignore */
    }
  }, [profile]);

  const derived = useMemo(() => {
    return {
      healthScore: calculateHealthScore(profile),
      fireProjection: calculateFIREProjection(profile),
      insights: generateInsights(profile),
      monthlySavings: getMonthlySavings(profile),
      savingsRate: getSavingsRate(profile),
      totalSpending: getTotalMonthlySpending(profile),
      fireNumber: getFIRENumber(profile),
    };
  }, [profile]);

  return (
    <FinancialContext.Provider value={{ profile, setProfile, ...derived }}>
      {children}
    </FinancialContext.Provider>
  );
}

export function useFinancial() {
  const ctx = useContext(FinancialContext);
  if (!ctx) throw new Error('useFinancial must be used inside FinancialProvider');
  return ctx;
}
