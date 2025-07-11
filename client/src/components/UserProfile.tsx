import { useState } from "react";
import { Wallet, ChevronDown, Flame, Star } from "lucide-react";

interface UserProfileProps {
  portfolio: any[];
  userProgress: any;
  etfs: any[];
  name: string;
  accountBalance: number;
  onLogout: () => void; 
}

export default function UserProfile({
  portfolio,
  userProgress,
  etfs,
  name,
  accountBalance,
  onLogout,
}: UserProfileProps) {
  const totalValue = portfolio.reduce((sum, holding) => {
    const etf = etfs.find((e) => e._id === holding.etf._id);
    return sum + holding.quantity * (etf?.price || 0);
  }, 0);

  const getInitials = (name: string) =>
    name ? name.slice(0, 2).toUpperCase() : "JD";

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="flex flex-col items-start p-4 space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-6 sm:p-0">
      <div className="grid w-full grid-cols-2 gap-4 sm:flex sm:space-x-4 sm:w-auto">
        {/* Daily Streak Card */}
        <div className="flex items-center px-4 py-2 space-x-3 border rounded-lg shadow-md bg-gradient-to-r from-amber-50 to-orange-50 border-amber-100">
          <Flame className="w-4 h-4 text-amber-500" />
          <div>
            <p className="text-xs text-amber-600">Daily Streak</p>
            <p className="text-sm font-medium sm:text-base text-amber-700">
              {userProgress?.streak} days
            </p>
          </div>
        </div>
        {/* Level Card */}
        <div className="px-4 py-2 border border-indigo-100 rounded-lg shadow-md bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center mb-1 space-x-2">
            <Star className="w-4 h-4 text-indigo-500" />
            <p className="text-xs text-indigo-600">Level {userProgress?.level}</p>
          </div>
          <div className="w-32 h-1.5 bg-indigo-100 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-500 bg-indigo-500 rounded-full"
              style={{
                width: `${
                  (userProgress?.currentXP / userProgress?.xpToNextLevel) * 100
                }%`,
              }}
            />
          </div>
          <p className="mt-1 text-xs text-indigo-600">
            {userProgress?.currentXP}/{userProgress?.xpToNextLevel} XP
          </p>
        </div>
        {/* Balance Card */}
        <div className="flex items-center px-4 py-2 space-x-3 bg-white border border-gray-100 rounded-lg shadow-md">
          <Wallet className="w-4 h-4 text-indigo-500" />
          <div>
            <p className="text-xs text-gray-500">Balance</p>
            <p className="text-sm font-medium text-gray-900 sm:text-base">
            ${accountBalance.toLocaleString()}
            </p>
          </div>
        </div>
        {/* User Info Button with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center px-3 py-2 space-x-2 transition-colors bg-white border border-gray-100 rounded-lg shadow-md hover:bg-gray-50"
          >
            <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-full shrink-0">
              <span className="text-sm font-medium text-indigo-600">
                {getInitials(name)}
              </span>
            </div>
            <span className="text-sm text-gray-700">{name || "Guest"}</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
          {/* Dropdown */}
          {isDropdownOpen && (
            <div className="absolute right-0 w-48 mt-2 bg-white border border-gray-100 rounded-lg shadow-lg">
              <button
                onClick={() => {
                  onLogout();
                  setIsDropdownOpen(false);
                }}
                className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}