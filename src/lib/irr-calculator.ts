import { MonthlyData, ChannelConfig } from '@/components/irr-calculator/types';

// Newton-Raphson 方法计算 IRR（年化收益率）
export const calculateIRR = (cashFlows: number[]): number | null => {
  if (cashFlows.length < 2) return null;

  let rate = 0.1;
  const maxIterations = 100;
  const tolerance = 1e-6;

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let derivative = 0;

    for (let t = 0; t < cashFlows.length; t++) {
      const discountFactor = Math.pow(1 + rate, t);
      npv += cashFlows[t] / discountFactor;
      derivative -= (t * cashFlows[t]) / Math.pow(1 + rate, t + 1);
    }

    if (Math.abs(npv) < tolerance) {
      return rate;
    }

    if (derivative === 0) return null;

    rate = rate - npv / derivative;
  }

  return null;
};

// Newton-Raphson 方法计算 XIRR（考虑现金流日期）
export const calculateXIRR = (
  cashFlows: number[],
  dates: string[]
): number | null => {
  if (cashFlows.length < 2 || cashFlows.length !== dates.length) return null;

  // 检查是否所有现金流都是0
  const allZero = cashFlows.every(cf => cf === 0);
  if (allZero) return null;

  // 检查是否包含非0的投入和收益（需要有正有负的现金流）
  const hasPositive = cashFlows.some(cf => cf > 0);
  const hasNegative = cashFlows.some(cf => cf < 0);
  if (!hasPositive || !hasNegative) return null;

  // 将日期字符串 "YYYY-MM" 转换为该月第一天的时间戳（使用UTC避免时区问题）
  const parseDateToTimestamp = (dateStr: string): number => {
    const [year, month] = dateStr.split('-').map(Number);
    // 创建该月第一天的UTC时间戳
    return Date.UTC(year, month - 1, 1);
  };

  const dateTimestamps = dates.map(d => parseDateToTimestamp(d));

  // 使用第一个日期作为基准日期
  const baseTimestamp = dateTimestamps[0];

  // 计算每个日期相对于基准日期的年数（精确到天）
  const yearFractions = dateTimestamps.map(ts => {
    const diffDays = (ts - baseTimestamp) / (1000 * 60 * 60 * 24);
    return diffDays / 365.25; // 使用365.25更精确
  });

  let rate = 0.1; // 初始猜测 10%
  const maxIterations = 500;
  const tolerance = 1e-10;

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let derivative = 0;
    let hasValidDiscount = false;

    for (let t = 0; t < cashFlows.length; t++) {
      const discountFactor = Math.pow(1 + rate, yearFractions[t]);
      // 当 discountFactor 过大时跳过，避免数值溢出
      if (Math.abs(discountFactor) > 1e20 || Math.abs(discountFactor) < 1e-20) continue;
      hasValidDiscount = true;
      npv += cashFlows[t] / discountFactor;
      derivative -= (yearFractions[t] * cashFlows[t]) / Math.pow(1 + rate, yearFractions[t] + 1);
    }

    // 如果没有有效的贴现因子，无法计算
    if (!hasValidDiscount) return null;

    // 如果 NPV 足够小，认为收敛
    if (Math.abs(npv) < tolerance) {
      // 如果收敛到接近0的rate，说明没有有效的内部收益率
      if (Math.abs(rate) < 0.0001) return null;
      return rate;
    }

    if (Math.abs(derivative) < 1e-20) return null;

    const newRate = rate - npv / derivative;

    // 防止 rate 超出合理范围
    if (newRate < -0.99 || newRate > 100) return null;

    // 如果rate更新变化很小，提前退出
    if (Math.abs(newRate - rate) < 1e-15) {
      if (Math.abs(rate) < 0.0001) return null;
      return rate;
    }

    rate = newRate;
  }

  // 迭代结束后检查最终结果
  if (Math.abs(rate) < 0.0001) return null;
  return rate;
};

// 计算各渠道毛利
export const calcChannelProfits = (
  monthlyReturn: number,
  channels: ChannelConfig[]
): number[] => {
  return channels.map(ch => {
    const ratio = ch.outputRatio / 100;
    const profitRate = ch.profitRate / 100;
    return monthlyReturn * ratio * profitRate / (1 - profitRate);
  });
};

// 计算卡费+投放（自动计算）
export const calcCardFee = (
  monthlyReturn: number,
  cardFeeRate: number,
  channels: ChannelConfig[]
): number => {
  const ticketRatio = channels[1].outputRatio; // 票机渠道占比
  const tripOnlineRatio = channels[2].outputRatio; // Trip线上渠道占比
  const feeRate = cardFeeRate / 100; // 卡费+投放费率
  return monthlyReturn * (ticketRatio + tripOnlineRatio) / 100 * (-feeRate);
};

// 计算单行现金流
export const calcRowCashFlow = (
  row: MonthlyData,
  channels: ChannelConfig[],
  cardFeeRate: number
): number => {
  const channelProfits = calcChannelProfits(row.monthlyReturn, channels);
  const totalChannelProfit = channelProfits.reduce((sum, p) => sum + p, 0);
  const autoCardFee = calcCardFee(row.monthlyReturn, cardFeeRate, channels);
  const totalCost = row.gtCost + autoCardFee;
  const totalIncome = row.monthlyReturn + row.newCustomerValue + row.otherIncome;
  return -row.investment + totalIncome + totalChannelProfit + totalCost;
};

export interface CalculatedResults {
  irr: number | null;
  annualizedReturn: number;
  cumulativeCashFlow: number[];
  cumulativeCapital: number[];
  cashFlows: number[];
  channelProfits: number[][];
  cardFees: number[];
  ticketProfit: number;
  ticketProfitRate: number;
  netRate: number;
  totalChannelProfit: number;
}

// 计算所有结果
export const calculateResults = (
  monthlyData: MonthlyData[],
  channels: ChannelConfig[],
  capitalCostRate: number,
  scenicReturnTimes: number,
  cardFeeRate: number
): CalculatedResults => {
  // 计算各行现金流
  const cashFlows = monthlyData.map(m =>
    calcRowCashFlow(m, channels, cardFeeRate)
  );

  // 获取日期列表
  const dates = monthlyData.map(m => m.date);

  // 使用XIRR计算年化收益率（考虑实际日期间隔）
  const irr = calculateXIRR(cashFlows, dates);
  const annualizedReturn = irr !== null ? irr * 100 : 0;

  // 计算累计现金流
  const cumulativeCashFlow = cashFlows.reduce<number[]>((acc, cf, idx) => {
    acc.push(idx === 0 ? cf : acc[idx - 1] + cf);
    return acc;
  }, []);

  // 计算累计资占
  const cumulativeCapital = cumulativeCashFlow.map((cf, idx) => {
    return cf * (-capitalCostRate / 100) / 12 / scenicReturnTimes;
  });

  // 计算各渠道毛利
  const channelProfits = monthlyData.map(m =>
    calcChannelProfits(m.monthlyReturn, channels)
  );

  // 计算各月卡费+投放
  const cardFees = monthlyData.map(m =>
    calcCardFee(m.monthlyReturn, cardFeeRate, channels)
  );

  // 计算总投入和总收益
  const totalInvestment = monthlyData.reduce((sum, m) => sum + m.investment, 0);
  const totalReturn = cashFlows.reduce((sum, cf) => sum + cf, 0);

  // 票面毛利 = 各渠道毛利之和
  const totalChannelProfit = channelProfits.flat().reduce((sum, p) => sum + p, 0);
  const ticketProfit = totalChannelProfit;

  // 票面毛利率 = 票面毛利 / (票面毛利 + 总投入)
  const ticketProfitRate = (ticketProfit + totalInvestment) > 0
    ? (ticketProfit / (ticketProfit + totalInvestment)) * 100
    : 0;

  // 净利率
  const netRate = totalInvestment > 0 ? (totalReturn / totalInvestment) * 100 : 0;

  return {
    irr,
    annualizedReturn,
    cumulativeCashFlow,
    cumulativeCapital,
    cashFlows,
    channelProfits,
    cardFees,
    ticketProfit,
    ticketProfitRate,
    netRate,
    totalChannelProfit,
  };
};
