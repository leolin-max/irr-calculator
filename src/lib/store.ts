'use client';

import { create } from 'zustand';
import { MonthlyData, ChannelConfig, generateInitialData, DEFAULT_CHANNELS } from '@/components/irr-calculator/types';

export interface IRRStore {
  capitalCostRate: number;
  cardFeeRate: number;
  scenicReturnTimes: number;
  channels: ChannelConfig[];
  monthlyData: MonthlyData[];

  setCapitalCostRate: (rate: number) => void;
  setCardFeeRate: (rate: number) => void;
  setScenicReturnTimes: (times: number) => void;
  updateChannel: (index: number, field: keyof ChannelConfig, value: string | number) => void;
  updateMonthData: (id: string, field: keyof MonthlyData, value: string | number) => void;
  addMonth: () => void;
  removeMonth: (id: string) => void;
  reset: () => void;
  loadFromStorage: () => void;
  saveToStorage: () => void;
  initialize: () => void;
}

const getDefaultState = () => ({
  capitalCostRate: 6,
  cardFeeRate: 4.2,
  scenicReturnTimes: 2,
  channels: DEFAULT_CHANNELS,
  monthlyData: generateInitialData(new Date()),
});

export const useIRRStore = create<IRRStore>((set, get) => ({
  ...getDefaultState(),

  setCapitalCostRate: (rate: number) => set({ capitalCostRate: rate }),
  setCardFeeRate: (rate: number) => set({ cardFeeRate: rate }),
  setScenicReturnTimes: (times: number) => set({ scenicReturnTimes: times }),

  updateChannel: (index: number, field: keyof ChannelConfig, value: string | number) =>
    set((state) => {
      const updated = [...state.channels];
      const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
      updated[index] = {
        ...updated[index],
        [field]: numValue,
      };
      return { channels: updated };
    }),

  updateMonthData: (id: string, field: keyof MonthlyData, value: string | number) =>
    set((state) => {
      if (field === 'date' && typeof value === 'string') {
        const index = state.monthlyData.findIndex(m => m.id === id);
        if (index === -1) return state;

        const updatedData = state.monthlyData.map((m, i) => {
          if (i < index) return m;
          if (i === index) {
            return { ...m, date: value };
          }
          let baseDate = new Date(value);
          baseDate.setMonth(baseDate.getMonth() + (i - index));
          return {
            ...m,
            date: `${baseDate.getFullYear()}-${String(baseDate.getMonth() + 1).padStart(2, '0')}`
          };
        });
        return { monthlyData: updatedData };
      }

      const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
      return {
        monthlyData: state.monthlyData.map(m =>
          m.id === id ? { ...m, [field]: numValue } : m
        ),
      };
    }),

  addMonth: () =>
    set((state) => {
      const lastMonth = state.monthlyData[state.monthlyData.length - 1];
      const lastDate = new Date(lastMonth.date);
      lastDate.setMonth(lastDate.getMonth() + 1);
      const newDate = `${lastDate.getFullYear()}-${String(lastDate.getMonth() + 1).padStart(2, '0')}`;

      return {
        monthlyData: [
          ...state.monthlyData,
          {
            id: Date.now().toString(),
            date: newDate,
            investment: 0,
            monthlyReturn: 0,
            newCustomerValue: 0,
            otherIncome: 0,
            gtCost: 0,
            cardFee: 0,
          },
        ],
      };
    }),

  removeMonth: (id: string) =>
    set((state) => {
      if (state.monthlyData.length > 1) {
        return {
          monthlyData: state.monthlyData.filter(m => m.id !== id),
        };
      }
      return state;
    }),

  reset: () => set(getDefaultState()),

  loadFromStorage: () => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem('irr_calculator_data');
      if (saved) {
        const data = JSON.parse(saved);
        set({
          capitalCostRate: data.capitalCostRate ?? 6,
          cardFeeRate: data.cardFeeRate ?? 4.2,
          scenicReturnTimes: data.scenicReturnTimes ?? 2,
          channels: data.channels ?? DEFAULT_CHANNELS,
          monthlyData: data.monthlyData ?? generateInitialData(new Date()),
        });
      }
    } catch (e) {
      console.error('Failed to load from storage:', e);
    }
  },

  saveToStorage: () => {
    if (typeof window === 'undefined') return;
    try {
      const state = get();
      const data = {
        capitalCostRate: state.capitalCostRate,
        cardFeeRate: state.cardFeeRate,
        scenicReturnTimes: state.scenicReturnTimes,
        channels: state.channels,
        monthlyData: state.monthlyData,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem('irr_calculator_data', JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to storage:', e);
    }
  },

  initialize: () => {
    if (typeof window === 'undefined') return;
    const state = get();
    if (state.monthlyData.length === 0) {
      set(getDefaultState());
    }
  },
}));
