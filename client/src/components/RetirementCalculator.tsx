// RetirementCalculator.tsx
import { useState, useEffect } from 'react';
import { Calculator, TrendingUp, AlertCircle } from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import { RetirementInputs } from '../types';

interface RetirementCalculatorProps {
  inputs: RetirementInputs;
  onInputChange: (inputs: Partial<RetirementInputs>) => void;
  etfs: any[];
}

interface MonteCarloResult {
  medianSavings: number;
  percentile10: number;
  percentile90: number;
  successProbability: number;
  simulationData: Array<{
    age: number;
    median: number;
    low: number;
    high: number;
  }>;
}

function normalRandom(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function runMonteCarloSimulation(inputs: RetirementInputs, etfs: any[], numSimulations: number = 1000): MonteCarloResult {
  const { currentAge, retirementAge, currentSavings, monthlyContribution, selectedETF, inflationRate, desiredRetirementIncome } = inputs;
  const yearsToRetirement = retirementAge - currentAge;
  const selectedETFData = etfs.find(etf => etf.symbol === selectedETF);
  
  if (!selectedETFData) throw new Error(`ETF with symbol ${selectedETF} not found`);
  
  const expectedReturn = selectedETFData.expectedAnnualReturn / 100;
  const volatility = selectedETFData.annualVolatility / 100;
  const inflation = inflationRate / 100;
  const requiredSavings = desiredRetirementIncome / 0.04;
  const allSimulations: number[][] = [];
  
  for (let sim = 0; sim < numSimulations; sim++) {
    let savings = currentSavings;
    const savingsPath = [savings];
    for ( let year = 0; year < yearsToRetirement; year++) {
      const annualReturn = expectedReturn + volatility * normalRandom();
      const annualContribution = 12 * monthlyContribution;
      savings = (savings + annualContribution) * (1 + annualReturn);
      savingsPath.push(savings);
    }
    allSimulations.push(savingsPath);
  }
  
  const finalSavingsList = allSimulations.map(sim => sim[sim.length - 1]).sort((a, b) => a - b);
  const medianSavings = finalSavingsList[Math.floor(numSimulations / 2)];
  const percentile10 = finalSavingsList[Math.floor(numSimulations * 0.1)];
  const percentile90 = finalSavingsList[Math.floor(numSimulations * 0.9)];
  const inflationAdjustedRequiredSavings = requiredSavings * Math.pow(1 + inflation, yearsToRetirement);
  const successProbability = finalSavingsList.filter(savings => savings >= inflationAdjustedRequiredSavings).length / numSimulations;
  
  const simulationData = [];
  for (let year = 0; year <= yearsToRetirement; year++) {
    const yearValues = allSimulations.map(sim => sim[year]).sort((a, b) => a - b);
    simulationData.push({
      age: currentAge + year,
      median: yearValues[Math.floor(numSimulations / 2)],
      low: yearValues[Math.floor(numSimulations * 0.1)],
      high: yearValues[Math.floor(numSimulations * 0.9)],
    });
  }

  return {
    medianSavings: medianSavings / Math.pow(1 + inflation, yearsToRetirement),
    percentile10: percentile10 / Math.pow(1 + inflation, yearsToRetirement),
    percentile90: percentile90 / Math.pow(1 + inflation, yearsToRetirement),
    successProbability,
    simulationData
  };
}

export default function RetirementCalculator({ inputs, onInputChange, etfs }: RetirementCalculatorProps) {
  const [monthlyTarget, setMonthlyTarget] = useState<number>(0);
  const [monteCarloResult, setMonteCarloResult] = useState<MonteCarloResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    calculateRetirements();
  }, [inputs, etfs]);

  const calculateRetirements = () => {
    try {
      setLoading(true);
      setError(null);
      const mcResult = runMonteCarloSimulation(inputs, etfs);
      setMonteCarloResult(mcResult);
      const selectedETFData = etfs.find((etf) => etf.symbol === inputs.selectedETF);
      if (!selectedETFData) throw new Error(`ETF with symbol ${inputs.selectedETF} not found`);
      const requiredMonthly = calculateRequiredMonthlySavings(
        inputs.desiredRetirementIncome,
        inputs.currentSavings,
        inputs.retirementAge - inputs.currentAge,
        selectedETFData.expectedAnnualReturn / 100,
        inputs.inflationRate / 100
      );
      setMonthlyTarget(requiredMonthly);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const calculateRequiredMonthlySavings = (goal: number, current: number, years: number, return_rate: number, inflation_rate: number): number => {
    const realRate = (1 + return_rate) / (1 + inflation_rate) - 1;
    const monthlyRate = realRate / 12;
    const months = years * 12;
    const futureGoal = goal / 0.04;
    const futureValueOfCurrent = current * Math.pow(1 + realRate, years);
    const additionalSavingsNeeded = futureGoal - futureValueOfCurrent;
    return additionalSavingsNeeded <= 0 ? 0 : additionalSavingsNeeded * monthlyRate / (Math.pow(1 + monthlyRate, months) - 1);
  };

  const formatCurrency = (value: number): string => {
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toFixed(0)}`;
  };

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-md">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Current Age</label>
            <input
              type="number"
              value={inputs.currentAge}
              onChange={(e) => onInputChange({ currentAge: Number(e.target.value) })}
              className="block w-full px-3 py-2 mt-1 transition-all bg-white border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Retirement Age</label>
            <input
              type="number"
              value={inputs.retirementAge}
              onChange={(e) => onInputChange({ retirementAge: Number(e.target.value) })}
              className="block w-full px-3 py-2 mt-1 transition-all bg-white border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Current Savings ($)</label>
            <input
              type="number"
              value={inputs.currentSavings}
              onChange={(e) => onInputChange({ currentSavings: Number(e.target.value) })}
              className="block w-full px-3 py-2 mt-1 transition-all bg-white border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
            />
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Monthly Contribution ($)</label>
            <input
              type="number"
              value={inputs.monthlyContribution}
              onChange={(e) => onInputChange({ monthlyContribution: Number(e.target.value) })}
              className="block w-full py-2 mt-1 transition-all bg-white border border-gray-200 rounded-md px3 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Desired Retirement Income ($)</label>
            <input
              type="number"
              value={inputs.desiredRetirementIncome}
              onChange={(e) => onInputChange({ desiredRetirementIncome: Number(e.target.value) })}
              className="block w-full px-3 py-2 mt-1 transition-all bg-white border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Expected Inflation Rate (%)</label>
            <input
              type="number"
              value={inputs.inflationRate}
              onChange={(e) => onInputChange({ inflationRate: Number(e.target.value) })}
              className="block w-full px-3 py-2 mt-1 transition-all bg-white border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {inputs.selectedETF && (
        <div className="p-4 mt-6 rounded-lg shadow-sm bg-indigo-50">
          <h4 className="text-sm font-medium text-indigo-800">Selected ETF: {inputs.selectedETF}</h4>
          <div className="mt-2 text-sm text-indigo-700">
            {etfs.find(etf => etf.symbol === inputs.selectedETF)?.name || 'Unknown ETF'}
            <span className="ml-2 px-2 py-0.5 bg-indigo-100 rounded-full text-xs">
              Expected Return: {etfs.find(etf => etf.symbol === inputs.selectedETF)?.expectedAnnualReturn || 0}%
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start p-4 mt-6 border border-red-100 rounded-lg shadow-sm bg-red-50">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-red-800">Error</h4>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {monteCarloResult && (
        <div className="p-6 mt-8 bg-white border border-gray-200 rounded-lg shadow-md">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Monte Carlo Simulation</h3>
          <div className="h-64 sm:h-80 lg:h-96">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monteCarloResult.simulationData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="age" label={{ value: 'Age', position: 'bottom', offset: 10 }} padding={{ left: 20, right: 20 }} />
                <YAxis tickFormatter={formatCurrency} label={{ value: 'Savings', angle: -90, position: 'insideLeft', offset: -5 }} padding={{ top: 20, bottom: 20 }} />
                <Tooltip formatter={(value: number) => [`${formatCurrency(value)}`, 'Projected Savings']} labelFormatter={(label) => `Age ${label}`} contentStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="high" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.2} name="90th Percentile" strokeWidth={2} />
                <Area type="monotone" dataKey="median" stackId="2" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} name="Median" strokeWidth={2} />
                <Area type="monotone" dataKey="low" stackId="3" stroke="#ffc658" fill="#ffc658" fillOpacity={0.2} name="10th Percentile" strokeWidth={2} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} iconSize={10} iconType="circle" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-4 text-xs text-gray-500">
            The chart shows the median, 10th percentile, and 90th percentile outcomes based on 1,000 simulations,
            taking into account the historical performance and volatility of {inputs.selectedETF}.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 mt-8 md:grid-cols-2">
        <div className="p-4 border rounded-lg shadow-md bg-gradient-to-br from-indigo-50 to-white lg:p-6 border-indigo-100/50">
          <div className="flex items-center mb-4">
            <Calculator className="w-5 h-5 mr-2 text-indigo-500" />
            <h3 className="text-sm font-medium text-gray-900">Required Monthly Savings</h3>
          </div>
          <p className="text-2xl font-semibold text-gray-900 sm:text-3xl">${monthlyTarget.toFixed(2)}</p>
          <p className="mt-2 text-sm text-gray-600">To reach your retirement income goal</p>
        </div>
        <div className="p-6 border rounded-lg shadow-md bg-gradient-to-br from-emerald-50 to-white border-emerald-100/50">
          <div className="flex items-center mb-4">
            <TrendingUp className="w-5 h-5 mr-2 text-emerald-500" />
            <h3 className="text-sm font-medium text-gray-900">Success Probability</h3>
          </div>
          <p className="font-semibold text-gray-900 text-2x1 sm:text-3xl">
            {monteCarloResult ? `${(monteCarloResult.successProbability * 100).toFixed(1)}%` : "0%"}
          </p>
          <p className="mt-2 text-sm text-gray-600">Chance of meeting your retirement goal</p>
        </div>
      </div>

      {monteCarloResult && (
        <div className="p-6 mt-8 bg-white border border-gray-200 rounded-lg shadow-md">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Detailed Simulation Results</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="p-4 rounded-lg shadow-sm bg-gray-50">
              <p className="text-sm text-gray-600">Median Projected Savings</p>
              <p className="text-xl font-semibold text-gray-900 sm:text-2xl">${monteCarloResult.medianSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              <p className="mt-1 text-xs text-gray-500">50% of simulations end with this amount or more</p>
            </div>
            <div className="p-4 rounded-lg shadow-sm bg-gray-50">
              <p className="text-sm text-gray-600">Pessimistic Scenario</p>
              <p className="text-xl font-semibold text-gray-900 sm:text-2xl">${monteCarloResult.percentile10.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              <p className="mt-1 text-xs text-gray-500">10th percentile (inflation-adjusted)</p>
            </div>
            <div className="p-4 rounded-lg shadow-sm bg-gray-50">
              <p className="text-sm text-gray-600">Optimistic Scenario</p>
              <p className="text-xl font-semibold text-gray-900 sm:text-2xl">${monteCarloResult.percentile90.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              <p className="mt-1 text-xs text-gray-500">90th percentile (inflation-adjusted)</p>
            </div>
          </div>
          <div className="p-4 mt-6 border border-yellow-100 rounded-lg shadow-sm bg-yellow-50">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> These projections are based on {inputs.selectedETF}'s expected annual return of
              {etfs.find(etf => etf.symbol === inputs.selectedETF)?.expectedAnnualReturn || 0}% and volatility of
              {etfs.find(etf => etf.symbol === inputs.selectedETF)?.annualVolatility || 0}%. Past performance is not indicative of future results.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}