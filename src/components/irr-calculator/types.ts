export interface MonthlyData {
  id: string;
  date: string;
  investment: number;
  monthlyReturn: number;
  newCustomerValue: number;
  otherIncome: number;
  gtCost: number;
  cardFee: number;
}

export interface ChannelConfig {
  name: string;
  profitRate: number;
  outputRatio: number;
}

export interface IRRCalculatorState {
  capitalCostRate: number;
  cardFeeRate: number;
  scenicReturnTimes: number;
  channels: ChannelConfig[];
  monthlyData: MonthlyData[];
}

// 生成指定年月的12个月数据
export const generateInitialData = (startDate: Date): MonthlyData[] => {
  const months: MonthlyData[] = [];
  for (let i = 0; i < 12; i++) {
    const date = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
    months.push({
      id: `month-${i + 1}`,
      date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      investment: 0,
      monthlyReturn: 0,
      newCustomerValue: 0,
      otherIncome: 0,
      gtCost: 0,
      cardFee: 0,
    });
  }
  return months;
};

// 默认渠道配置
export const DEFAULT_CHANNELS: ChannelConfig[] = [
  { name: '景区渠道', profitRate: 0, outputRatio: 0 },
  { name: '票机渠道', profitRate: 0, outputRatio: 0 },
  { name: 'Trip线上渠道', profitRate: 0, outputRatio: 0 },
  { name: 'Trip线下渠道', profitRate: 0, outputRatio: 0 },
];
