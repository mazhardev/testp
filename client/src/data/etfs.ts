// data/etfs.ts
import { ETF } from '../types';

export const etfs: ETF[] = [
  {
    symbol: 'VTI',
    name: 'Vanguard Total Stock Market ETF',
    expenseRatio: 0.03,
    sector: 'Total Market',
    yearToDateReturn: 7.2,
    oneYearReturn: 24.5,
    aum: 350.2,
    expectedAnnualReturn: 10.5, // Slightly below VOO due to broader market exposure
    annualVolatility: 15.0
  },
  {
    symbol: 'VOO',
    name: 'Vanguard S&P 500 ETF',
    expenseRatio: 0.03,
    sector: 'Large-Cap Blend',
    yearToDateReturn: 7.8,
    oneYearReturn: 25.1,
    aum: 320.5,
    expectedAnnualReturn: 10.8, // As requested
    annualVolatility: 14.0
  },
  {
    symbol: 'QQQ',
    name: 'Invesco QQQ Trust',
    expenseRatio: 0.20,
    sector: 'Large-Cap Growth',
    yearToDateReturn: 9.5,
    oneYearReturn: 43.2,
    aum: 245.8,
    expectedAnnualReturn: 11.5, // Higher due to growth stocks
    annualVolatility: 20.0
  },
  {
    symbol: 'IWM',
    name: 'iShares Russell 2000 ETF',
    expenseRatio: 0.19,
    sector: 'Small-Cap Blend',
    yearToDateReturn: 2.1,
    oneYearReturn: 16.8,
    aum: 56.4,
    expectedAnnualReturn: 9.0, // Small caps have higher risk/return
    annualVolatility: 18.0
  },
  {
    symbol: 'VGT',
    name: 'Vanguard Information Technology ETF',
    expenseRatio: 0.10,
    sector: 'Technology',
    yearToDateReturn: 11.2,
    oneYearReturn: 47.3,
    aum: 54.9,
    expectedAnnualReturn: 11.8, // Tech sector, high growth
    annualVolatility: 22.0
  },
  {
    symbol: 'SCHD',
    name: 'Schwab U.S. Dividend Equity ETF',
    expenseRatio: 0.06,
    sector: 'Large-Cap Value',
    yearToDateReturn: 5.0,
    oneYearReturn: 15.2,
    aum: 52.7,
    expectedAnnualReturn: 9.5, // Value stocks, slightly lower than S&P
    annualVolatility: 13.0
  },
  {
    symbol: 'BND',
    name: 'Vanguard Total Bond Market ETF',
    expenseRatio: 0.03,
    sector: 'Bonds',
    yearToDateReturn: -0.5,
    oneYearReturn: 3.8,
    aum: 90.1,
    expectedAnnualReturn: 4.5, // Bonds have lower returns
    annualVolatility: 6.0
  },
  {
    symbol: 'EEM',
    name: 'iShares MSCI Emerging Markets ETF',
    expenseRatio: 0.68,
    sector: 'Emerging Markets',
    yearToDateReturn: 4.2,
    oneYearReturn: 12.7,
    aum: 18.9,
    expectedAnnualReturn: 8.0, // Emerging markets, higher risk
    annualVolatility: 17.0
  },
  {
    symbol: 'VXUS',
    name: 'Vanguard Total International Stock ETF',
    expenseRatio: 0.07,
    sector: 'International Equity',
    yearToDateReturn: 3.8,
    oneYearReturn: 14.5,
    aum: 65.3,
    expectedAnnualReturn: 8.2, // International stocks
    annualVolatility: 15.5
  },
  {
    symbol: 'SMH',
    name: 'VanEck Semiconductor ETF',
    expenseRatio: 0.35,
    sector: 'Semiconductors',
    yearToDateReturn: 15.6,
    oneYearReturn: 60.4,
    aum: 14.2,
    expectedAnnualReturn: 12.0, // High growth, high volatility
    annualVolatility: 25.0
  },
  {
    symbol: 'GLD',
    name: 'SPDR Gold Shares',
    expenseRatio: 0.40,
    sector: 'Commodities',
    yearToDateReturn: 10.2,
    oneYearReturn: 18.9,
    aum: 59.8,
    expectedAnnualReturn: 6.0, // Gold, moderate returns
    annualVolatility: 12.0
  },
  {
    symbol: 'REET',
    name: 'iShares Global REIT ETF',
    expenseRatio: 0.14,
    sector: 'Real Estate',
    yearToDateReturn: -2.3,
    oneYearReturn: 8.7,
    aum: 3.6,
    expectedAnnualReturn: 7.0, // Real estate, moderate returns
    annualVolatility: 16.0
  }
];