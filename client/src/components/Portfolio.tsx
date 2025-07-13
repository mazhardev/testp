import { useState, useEffect } from "react";
import axios from "axios";
import {
  DollarSign,
  AlertCircle,
  RefreshCw,
  PieChart,
} from "lucide-react";
import {
  PieChart as RechartsChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import api from "../utils/api";

interface PortfolioProps {
  portfolio: any[];
  setPortfolio: (portfolio: any) => void;
  etfs: { _id: string; symbol: string; price: number; name: string }[];
  token: string | null;
  fetchPortfolio: () => void;
  setAccountBalance: (balance: number) => void;
}

  // const uri = 'https://finance-zqy2.onrender.com'
  const uri = "http://localhost:3000"; 

export default function Portfolio({
  portfolio,
  setPortfolio,
  etfs,
  token,
  fetchPortfolio,
  setAccountBalance,
}: PortfolioProps) {
  const [selectedETFId, setSelectedETFId] = useState(() => {
    if (etfs && etfs.length > 0 && etfs[0]._id) {
      return etfs[0]._id;
    }
    return "";
  });
    
  const [tradeAmount, setTradeAmount] = useState("");
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");

  useEffect(() => {
    if (etfs && etfs.length > 0 && etfs[0]._id && !selectedETFId) {
      console.log("Setting ETF ID from effect:", etfs[0]._id);
      setSelectedETFId(etfs[0]._id);
    }
  }, [etfs, selectedETFId]);

  const resetDemo = async() => {
    setTradeAmount("");
    setTradeType("buy");
    setSelectedETFId(etfs && etfs.length > 0 ? etfs[0]._id : "");
    try {
      fetchPortfolio();
      const balanceRes = await api.get(`${uri}/api/v1/portfolio/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAccountBalance(balanceRes.data.data);
    } catch (err) {
      console.error("Failed to refresh data:", err);
      alert("Failed to refresh data. Please try again.");
    }

  };

  const handleTrade = async () => {
    console.log("Trade button clicked!");
    const amount = Number(tradeAmount);
    console.log("Amount:", amount);
    if (!amount || amount <= 0) {
      console.log("Invalid amount");
      return;
    }
    if (!etfs || etfs.length === 0) {
      console.error("No ETFs available");
      alert("No ETFs available for trading");
      return;
    }

    let currentETFId = selectedETFId;
    if (!currentETFId && etfs.length > 0) {
      currentETFId = etfs[0]._id;
      setSelectedETFId(currentETFId);
    }
    console.log("Current ETF ID:", currentETFId);

    const etf = etfs.find((e) => e._id === currentETFId);
  console.log("Selected ETF:", etf);
    if (!etf) {
      console.log("ETF not found");
      return;
    }
    
    try {
      console.log("Sending request...");
      await api.post(
        `${uri}/api/v1/portfolio/${tradeType === "buy" ? "buyetf" : "selletfs"}`,
        { etfId: selectedETFId, quantity: amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPortfolio();
      setTradeAmount("");
    } catch (err: any) {
      console.error("Full error:", err);
      console.error("Error response:", err.response?.data);
      alert("Trade failed: " + (err.response?.data?.message || err.message));
    }
  };

  const totalValue = portfolio.reduce((sum, holding) => {
    const etf = etfs.find((e) => e._id === holding.etf._id);
    return sum + holding.quantity * (etf?.price || 0);
  }, 0);

  const pieChartData = portfolio.map((holding) => {
    const etf = etfs.find((e) => e._id === holding.etf._id);
    const value = holding.quantity * (etf?.price || 0);
    return {
      name: etf?.symbol || "Unknown",
      value: value,
    };
  });

  const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  const RADIAN = Math.PI / 180;

  return (
    <div className="p-4 mx-auto space-y-8 sm:p-6 max-w-7xl">
      {/* Header Section */}
      <div className="flex flex-col items-center justify-between p-6 border border-indigo-200 shadow-lg sm:flex-row rounded-xl bg-indigo-50">
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-full">
            <DollarSign className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-indigo-900">
              Trading Account
            </h3>
            <p className="text-sm text-indigo-600">
              Manage your ETF investments with ease
            </p>
          </div>
        </div>
        <button
          onClick={resetDemo}
          className="flex items-center px-4 py-2.5 mt-4 space-x-2 text-indigo-600 transition-colors duration-200 bg-white border border-indigo-300 rounded-lg shadow-sm sm:mt-0 hover:bg-indigo-100 hover:border-indigo-400"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="text-sm font-medium">Refresh</span>
        </button>
      </div>

      {/* Portfolio Value Card */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="p-6 transition-shadow duration-200 border border-indigo-200 shadow-lg rounded-xl bg-gradient-to-br from-indigo-50 to-white hover:shadow-xl">
          <div className="flex items-center mb-4">
            <DollarSign className="w-6 h-6 mr-3 text-indigo-600" />
            <h3 className="text-base font-semibold text-gray-900">
              Total Portfolio Value
            </h3>
          </div>
          <p className="text-4xl font-bold text-gray-900">
            ${totalValue.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        {/* Portfolio Allocation */}
        <div className="px-3 pt-3 transition-shadow duration-200 bg-white border border-gray-200 shadow-lg rounded-xl hover:shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Portfolio Allocation
            </h2>
            <PieChart className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsChart>
                <Pie
                  data={pieChartData} 
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  stroke="#fff"
                  strokeWidth={2}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [
                    `$${value.toFixed(2)}`,
                    "Value",
                  ]}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                    padding: "10px",
                  }}
                />
              </RechartsChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-4">
              {pieChartData.map((entry, index) => (
                <div key={entry.name} className="flex items-center p-2 space-x-2 rounded-lg hover:bg-gray-50">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {entry.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trade ETFs */}
        <div className="p-6 transition-shadow duration-200 bg-white border border-gray-200 shadow-lg rounded-xl hover:shadow-xl">
          <h2 className="mb-6 text-xl font-semibold text-gray-900">Trade ETFs</h2>
          <div className="space-y-5">
            <div>
              <label className="block mb-1.5 text-sm font-medium text-gray-700">
                Select ETF
              </label>
              <select
                value={selectedETFId || (etfs.length > 0 ? etfs[0]._id : "")}
                onChange={(e) => setSelectedETFId(e.target.value)}
                className="w-full px-4 py-3 transition-colors duration-200 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {etfs.map((etf) => (
                  <option key={etf._id} value={etf._id}>
                    {etf.symbol} - {etf.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1.5 text-sm font-medium text-gray-700">
                Trade Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setTradeType("buy")}
                  className={`px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                    tradeType === "buy"
                      ? "bg-indigo-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-300"
                  }`}
                >
                  Buy
                </button>
                <button
                  onClick={() => setTradeType("sell")}
                  className={`px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                    tradeType === "sell"
                      ? "bg-indigo-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-300"
                  }`}
                >
                  Sell
                </button>
              </div>
            </div>

            <div>
              <label className="block mb-1.5 text-sm font-medium text-gray-700">
                Number of Shares
              </label>
              <input
                type="number"
                value={tradeAmount}
                onChange={(e) => setTradeAmount(e.target.value)}
                className="w-full px-4 py-3 transition-colors duration-200 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                min="0"
                step="1"
                placeholder="Enter shares"
              />
            </div>

            <button
              onClick={handleTrade}
              className="w-full px-4 py-3 text-sm font-medium text-white transition-colors duration-200 bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700"
            >
              Execute Trade
            </button>
          </div>
        </div>

        {/* Holdings Table */}
        <div className="p-6 transition-shadow duration-200 bg-white border border-gray-200 shadow-lg rounded-xl hover:shadow-xl xl:col-span-2">
          <h2 className="mb-6 text-xl font-semibold text-gray-900">
            Your Holdings
          </h2>
          <div className="overflow-x-auto rounded-lg shadow-md">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3.5 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">
                    Symbol
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">
                    Shares
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">
                    Avg Price
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">
                    Current Value
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {portfolio.map((holding) => {
                  const etf = etfs.find((e) => e._id === holding.etf._id);
                  const currentValue = holding.quantity * (etf?.price || 0);
                  return (
                    <tr
                      key={etf?._id}
                      className="transition-colors duration-150 hover:bg-indigo-50"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {etf?.symbol || "Unknown"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {holding.quantity}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        ${holding.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        ${currentValue.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {portfolio.length === 0 && (
              <div className="py-10 text-center">
                <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500">
                  No holdings yet. Start trading to build your portfolio!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="flex items-start p-5 space-x-3 border shadow-md rounded-xl bg-amber-50 border-amber-200">
        <AlertCircle className="h-6 w-6 text-amber-500 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="text-base font-semibold text-amber-800">
            Trading Information
          </h4>
          <p className="mt-1.5 text-sm text-amber-700">
            Buy and sell ETFs using your account balance. Monitor your holdings
            and portfolio value in real-time.
          </p>
        </div>
      </div>
    </div>
  );
}
