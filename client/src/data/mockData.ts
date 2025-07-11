import { Friend, Competition, Achievement, DailyChallenge, UserProgress } from '../types';

export const mockUserProgress: UserProgress = {
  level: 5,
  currentXP: 2340,
  xpToNextLevel: 3000,
  streak: 7,
  lastActive: new Date().toISOString(),
  totalXP: 12340,
  badges: ['early-adopter', 'smart-investor', 'social-butterfly']
};

export const mockDailyChallenges: DailyChallenge[] = [
  {
    id: 'daily-trade',
    title: 'Daily Trader',
    description: 'Make at least one trade today',
    reward: 50,
    completed: false,
    type: 'trade',
    progress: 0,
    target: 1
  },
  {
    id: 'learn-etf',
    title: 'ETF Scholar',
    description: 'Read 3 ETF descriptions',
    reward: 30,
    completed: false,
    type: 'learn',
    progress: 2,
    target: 3
  },
  {
    id: 'social-engage',
    title: 'Community Leader',
    description: 'Interact with 2 community members',
    reward: 40,
    completed: false,
    type: 'social',
    progress: 1,
    target: 2
  }
];

export const mockAchievements: Achievement[] = [
  {
    id: 'first-trade',
    title: 'First Steps',
    description: 'Complete your first ETF trade',
    icon: 'Rocket',
    progress: 1,
    maxProgress: 1,
    reward: 100,
    unlocked: true,
    category: 'trading'
  },
  {
    id: 'social-butterfly',
    title: 'Social Butterfly',
    description: 'Connect with 5 friends',
    icon: 'Users',
    progress: 3,
    maxProgress: 5,
    reward: 200,
    unlocked: false,
    category: 'social'
  },
  {
    id: 'competition-winner',
    title: 'Champion Trader',
    description: 'Win a trading competition',
    icon: 'Trophy',
    progress: 0,
    maxProgress: 1,
    reward: 500,
    unlocked: false,
    category: 'trading'
  },
  {
    id: 'portfolio-diversity',
    title: 'Diversification Master',
    description: 'Hold 5 different ETFs',
    icon: 'PieChart',
    progress: 2,
    maxProgress: 5,
    reward: 300,
    unlocked: false,
    category: 'trading'
  }
];

export const mockFriends: Friend[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    portfolioValue: 125000,
    status: 'online',
    lastActive: 'now'
  },
  {
    id: '2',
    name: 'Michael Rodriguez',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    portfolioValue: 98000,
    status: 'offline',
    lastActive: '2 hours ago'
  },
  {
    id: '3',
    name: 'Emma Thompson',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    portfolioValue: 156000,
    status: 'online',
    lastActive: 'now'
  }
];

export const mockCompetitions: Competition[] = [
  {
    id: '1',
    title: 'Spring Trading Challenge',
    startDate: '2024-03-01',
    endDate: '2024-03-31',
    participants: [
      { userId: '1', name: 'Sarah Chen', portfolioValue: 125000, rank: 1, investmentStrategy: 'aggressive', riskTolerance: 'high' },
      { userId: '2', name: 'Michael Rodriguez', portfolioValue: 98000, rank: 3, investmentStrategy: 'conservative', riskTolerance: 'low' },
      { userId: '3', name: 'Emma Thompson', portfolioValue: 156000, rank: 2, investmentStrategy: 'moderate', riskTolerance: 'medium' }
    ],
    prize: '$500 Amazon Gift Card',
    status: 'active'
  },
  {
    id: '2',
    title: 'ETF Masters League',
    startDate: '2024-04-01',
    endDate: '2024-04-30',
    participants: [],
    prize: 'Premium Account (1 Year)',
    status: 'upcoming'
  }
];