import { Clock, TrendingUp, DollarSign, Target, ArrowRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RetirementInputs } from '../types';



export interface OverviewProps {
  inputs: RetirementInputs;
  onEditInputs: () => void;
  etfs: any[];
}

export default function Overview({ inputs, onEditInputs, etfs }: OverviewProps) {
  const yearsToRetirement = inputs.retirementAge - inputs.currentAge;
  const selectedETF = etfs.find(etf => etf.symbol === inputs.selectedETF);
  const expectedReturn = selectedETF ? selectedETF.expectedAnnualReturn / 100 : 0.07;

  const calculateProjectedSavings = () => {
    const monthlyRate = expectedReturn / 12;
    const numberOfMonths = yearsToRetirement * 12;
    let futureValue = inputs.currentSavings;
    for (let i = 0; i < numberOfMonths; i++) {
      futureValue = (futureValue + inputs.monthlyContribution) * (1 + monthlyRate);
    }
    return futureValue;
  };

  const projectedSavings = calculateProjectedSavings();
  const monthlyIncomeAtRetirement = (projectedSavings * 0.04) / 12;

  const generateProjectionData = () => {
    const data = [];
    let currentSavings = inputs.currentSavings;
    const monthlyRate = expectedReturn / 12;
    for (let year = 0; year <= yearsToRetirement; year++) {
      data.push({
        age: inputs.currentAge + year,
        projected: currentSavings,
        goal: (inputs.desiredRetirementIncome * 25) * (1 + inputs.inflationRate / 100) ** year
      });
      for (let month = 0; month < 12; month++) {
        currentSavings = (currentSavings + inputs.monthlyContribution) * (1 + monthlyRate);
      }
    }
    return data;
  };

  const projectionData = generateProjectionData();


  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        <div className="p-6 transition-shadow border shadow-lg rounded-xl bg-gradient-to-br from-indigo-50 to-white border-indigo-100/50 hover:shadow-xl">
          <div className="flex items-center mb-4">
            <Clock className="w-6 h-6 mr-3 text-indigo-600" />
            <h3 className="text-sm font-medium text-gray-900">Time to Retirement</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 sm:text-3xl">{yearsToRetirement}</p>
          <p className="mt-2 text-sm text-gray-600">Years remaining</p>
        </div>
        <div className="p-6 transition-shadow border shadow-lg rounded-xl bg-gradient-to-br from-emerald-50 to-white border-emerald-100/50 hover:shadow-xl">
          <div className="flex items-center mb-4">
            <TrendingUp className="w-6 h-6 mr-3 text-emerald-600" />
            <h3 className="text-sm font-medium text-gray-900">Projected Savings</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 sm:text-3xl">${Math.round(projectedSavings).toLocaleString()}</p>
          <p className="mt-2 text-sm text-gray-600">At retirement age</p>
        </div>
        <div className="p-6 transition-shadow border shadow-lg rounded-xl bg-gradient-to-br from-amber-50 to-white border-amber-100/50 hover:shadow-xl">
          <div className="flex items-center mb-4">
            <DollarSign className="w-6 h-6 mr-3 text-amber-600" />
            <h3 className="text-sm font-medium text-gray-900">Monthly Income</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 sm:text-3xl">${Math.round(monthlyIncomeAtRetirement).toLocaleString()}</p>
          <p className="mt-2 text-sm text-gray-600">Estimated monthly at retirement</p>
        </div>
        <div className="p-6 transition-shadow border shadow-lg rounded-xl bg-gradient-to-br from-rose-50 to-white border-rose-100/50 hover:shadow-xl">
          <div className="flex items-center mb-4">
            <Target className="w-6 h-6 mr-3 text-rose-600" />
            <h3 className="text-sm font-medium text-gray-900">Monthly Goal</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 sm:text-3xl">${Math.round(inputs.monthlyContribution).toLocaleString()}</p>
          <p className="mt-2 text-sm text-gray-600">Current monthly contribution</p>
        </div>
      </div>

      <div className="p-6 bg-white border border-gray-200 shadow-lg rounded-xl">
        <div className="flex flex-col justify-between gap-4 mb-6 sm:flex-row sm:items-center">
          <h2 className="text-lg font-semibold text-gray-900">Retirement Savings Projection</h2>
          <button onClick={onEditInputs} className="flex items-center px-5 py-2.5 space-x-2 text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700">
            <span>Adjust Plan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="h-64 sm:h-80 lg:h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={projectionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="age" label={{ value: 'Age', position: 'bottom', offset: 0 }} stroke="#6b7280" />
              <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} label={{ value: 'Savings', angle: -90, position: 'insideLeft' }} stroke="#6b7280" />
              <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']} labelFormatter={(label) => `Age ${label}`} contentStyle={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Line type="monotone" dataKey="projected" stroke="#6366f1" strokeWidth={3} name="Projected Savings" dot={{ fill: '#6366f1', strokeWidth: 2 }} activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="goal" stroke="#f43f5e" strokeWidth={2} strokeDasharray="5 5" name="Retirement Goal" dot={{ fill: '#f43f5e', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="p-6 bg-white border border-gray-200 shadow-lg rounded-xl">
        <h2 className="mb-5 text-lg font-semibold text-gray-900">Current Investment Strategy</h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-medium text-gray-700">Selected ETF</h3>
            <div className="p-5 transition-shadow rounded-lg shadow-md bg-gray-50 hover:shadow-lg">
              <p className="text-lg font-medium text-gray-900">{selectedETF?.symbol}</p>
              <p className="text-sm text-gray-600">{selectedETF?.name}</p>
              <div className="mt-3 space-y-2">
                <div className="flex items-center">
                  <div className="w-2 h-2 mr-2 bg-indigo-500 rounded-full"></div>
                  <p className="text-sm text-gray-600">Expense Ratio: <span className="font-medium">{selectedETF?.expenseRatio}%</span></p>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 mr-2 rounded-full bg-emerald-500"></div>
                  <p className="text-sm text-gray-600">1Y Return: <span className="font-medium">{selectedETF?.oneYearReturn}%</span></p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium text-gray-700">Portfolio Allocation</h3>
            <div className="p-5 transition-shadow rounded-lg shadow-md bg-gray-50 hover:shadow-lg">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Current Savings</span>
                  <span className="text-sm font-medium text-gray-900">${inputs.currentSavings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Monthly Contribution</span>
                  <span className="text-sm font-medium text-gray-900">${inputs.monthlyContribution.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Expected Return</span>
                  <span className="text-sm font-medium text-gray-900">{(expectedReturn * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Inflation Rate</span>
                  <span className="text-sm font-medium text-gray-900">{inputs.inflationRate}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}