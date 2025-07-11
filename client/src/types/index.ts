export interface ETF {
  symbol: string;
  name: string;
  expenseRatio: number;
  sector: string;
  yearToDateReturn: number;
  oneYearReturn: number;
  aum: number;
  expectedAnnualReturn?: number;
  annualVolatility?: number;
}

export interface Portfolio {
  etfHoldings: {
    symbol: string;
    shares: number;
    averagePrice: number;
  }[];
  cashBalance: number;
  rewardPoints: number;
}

export interface Friend {
  id: string;
  name: string;
  avatar: string;
  portfolioValue: number;
  status: 'online' | 'offline';
  lastActive: string;
}

export interface Competition {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  participants: {
    userId: string;
    name: string;
    portfolioValue: number;
    rank: number;
    investmentStrategy: 'aggressive' | 'moderate' | 'conservative';
    riskTolerance: 'high' | 'medium' | 'low';
  }[];
  prize: string;
  status: 'active' | 'completed' | 'upcoming';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  maxProgress: number;
  reward: number;
  unlocked: boolean;
  category: 'trading' | 'social' | 'learning';
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  reward: number;
  completed: boolean;
  type: 'trade' | 'learn' | 'social';
  progress: number;
  target: number;
}

export interface UserProgress {
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  streak: number;
  lastActive: string;
  totalXP: number;
  badges: string[];
}

export interface RetirementInputs {
  currentAge: number;
  retirementAge: number;
  currentSavings: number;
  monthlyContribution: number;
  desiredRetirementIncome: number;
  selectedETF: string;
  inflationRate: number;
}