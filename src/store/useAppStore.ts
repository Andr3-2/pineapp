import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { monthKey } from '@/lib/date';

export type ThemePreference = 'light' | 'dark' | 'device';
export type WeeklyGoal = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type SessionDuration = 1 | 5 | 10 | 30;

interface AppState {
  // Onboarding
  name: string;
  weeklyGoal: WeeklyGoal;
  theme: ThemePreference;
  onboardingComplete: boolean;

  // Tracker
  completedByMonth: Record<string, number[]>;
  viewedYear: number;
  viewedMonth: number;

  // Session
  selectedDuration: SessionDuration;
  isRunning: boolean;
  sessionStartedAt: number | null;
  sessionDurationSeconds: number;
  justFinished: boolean;

  setName: (name: string) => void;
  setWeeklyGoal: (goal: WeeklyGoal) => void;
  setTheme: (theme: ThemePreference) => void;
  completeOnboarding: () => void;
  restoreData: (data: {
    name: string;
    weeklyGoal: WeeklyGoal;
    theme: ThemePreference;
    selectedDuration: SessionDuration;
    completedByMonth: Record<string, number[]>;
  }) => void;

  pageMonth: (delta: number) => void;
  goToCurrentMonth: () => void;

  setSelectedDuration: (duration: SessionDuration) => void;
  startSession: (durationSeconds?: number) => void;
  endSessionEarly: () => void;
  finishSession: () => void;
  dismissJustFinished: () => void;
}

const today = new Date();

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      name: '',
      weeklyGoal: 5,
      theme: 'device',
      onboardingComplete: false,

      completedByMonth: {},
      viewedYear: today.getFullYear(),
      viewedMonth: today.getMonth(),

      selectedDuration: 10,
      isRunning: false,
      sessionStartedAt: null,
      sessionDurationSeconds: 10 * 60,
      justFinished: false,

      setName: (name) => set({ name }),
      setWeeklyGoal: (weeklyGoal) => set({ weeklyGoal }),
      setTheme: (theme) => set({ theme }),
      completeOnboarding: () => set({ onboardingComplete: true }),
      restoreData: (data) => set({ ...data }),

      pageMonth: (delta) => {
        const total = get().viewedYear * 12 + get().viewedMonth + delta;
        set({
          viewedYear: Math.floor(total / 12),
          viewedMonth: ((total % 12) + 12) % 12,
        });
      },

      goToCurrentMonth: () => {
        const now = new Date();
        set({ viewedYear: now.getFullYear(), viewedMonth: now.getMonth() });
      },

      setSelectedDuration: (selectedDuration) => set({ selectedDuration }),

      startSession: (durationSeconds) => {
        const seconds = durationSeconds ?? get().selectedDuration * 60;
        set({
          isRunning: true,
          sessionStartedAt: Date.now(),
          sessionDurationSeconds: seconds,
          justFinished: false,
        });
      },

      endSessionEarly: () => {
        set({ isRunning: false, sessionStartedAt: null });
      },

      finishSession: () => {
        if (!get().isRunning) return;
        const now = new Date();
        const key = monthKey(now.getFullYear(), now.getMonth());
        const day = now.getDate();
        const existing = get().completedByMonth[key] ?? [];
        const completedByMonth = existing.includes(day)
          ? get().completedByMonth
          : {
              ...get().completedByMonth,
              [key]: [...existing, day].sort((a, b) => a - b),
            };

        set({
          isRunning: false,
          sessionStartedAt: null,
          justFinished: true,
          completedByMonth,
        });
      },

      dismissJustFinished: () => set({ justFinished: false }),
    }),
    {
      name: 'pine-app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        name: state.name,
        weeklyGoal: state.weeklyGoal,
        theme: state.theme,
        onboardingComplete: state.onboardingComplete,
        completedByMonth: state.completedByMonth,
        selectedDuration: state.selectedDuration,
        isRunning: state.isRunning,
        sessionStartedAt: state.sessionStartedAt,
        sessionDurationSeconds: state.sessionDurationSeconds,
      }),
    },
  ),
);
