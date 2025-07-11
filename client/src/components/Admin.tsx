import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    PieChart, Pie, Cell, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    LineChart, Line, ResponsiveContainer
    } from "recharts";
    import { ArrowLeft, Users, TrendingUp, Activity, Trophy, DollarSign, Star, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    }

    interface ETF {
    _id: string;
    symbol: string;
    price: number;
    }

    interface Stock {
    etf: ETF;
    quantity: number;
    }

    interface Portfolio {
    _id: string;
    user: User;
    stocks: Stock[];
    }

    interface TradeHistory {
    _id: string;
    user: User;
    action: string;
    date: string;
    }

    interface ChallengeInvitation {
    _id: string;
    sender: User;
    recipient: User;
    challengeId: string;
    status: string;
    }

    interface Balance {
    _id: string;
    user: User;
    amount: number;
    }

    interface XP {
    _id: string;
    user: User;
    xp: number;
    }

    interface PortfolioHolding {
    etf: ETF;
    quantity: number;
    }

    interface AdminPanelProps {
    portfolio: PortfolioHolding[];
    etfs: ETF[];
    }

    const AdminPanel: React.FC<AdminPanelProps> = ({ portfolio, etfs }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
    const [tradeHistories, setTradeHistories] = useState<TradeHistory[]>([]);
    const [challengeInvitations, setChallengeInvitations] = useState<ChallengeInvitation[]>([]);
    const [balances, setBalances] = useState<Balance[]>([]);
    const [xps, setXps] = useState<XP[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showAllTrades, setShowAllTrades] = useState<boolean>(false);
    const token = localStorage.getItem("token");
    const uri = "http://localhost:3000";
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAdminData = async () => {
        try {
            const [
            usersRes,
            portfoliosRes,
            tradeHistoriesRes,
            challengeInvitationsRes,
            balancesRes,
            xpsRes,
            ] = await Promise.all([
            axios.get(`${uri}/api/v1/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`${uri}/api/v1/admin/portfolios`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`${uri}/api/v1/admin/tradehistories`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`${uri}/api/v1/admin/challengeinvitations`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`${uri}/api/v1/admin/balances`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`${uri}/api/v1/admin/xps`, { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            
            setUsers(usersRes.data.data);
            setPortfolios(portfoliosRes.data.data);
            setTradeHistories(tradeHistoriesRes.data.data);
            setChallengeInvitations(challengeInvitationsRes.data.data);
            setBalances(balancesRes.data.data);
            setXps(xpsRes.data.data);
            setLoading(false);
        } catch (err) {
            setError("Failed to fetch admin data");
            setLoading(false);
        }
        };
        
        if (token) fetchAdminData();
    }, [token]);

    if (loading) {
        return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            <p className="text-lg text-slate-600">Loading admin data...</p>
            </div>
        </div>
        );
    }

    if (error) {
        return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="max-w-md p-6 border border-red-200 rounded-lg bg-red-50">
            <div className="text-lg font-semibold text-red-600">Error</div>
            <p className="mt-2 text-red-700">{error}</p>
            </div>
        </div>
        );
    }

    const totalValue = portfolio.reduce((sum, holding) => {
        const etf = etfs.find((e) => e._id === holding.etf._id);
        return sum + holding.quantity * (etf?.price || 0);
    }, 0);

    const totalUsers = users.length;
    const portfolioValues = portfolios.map(portfolio => ({
        userId: portfolio.user._id,
        value: portfolio.stocks.reduce((sum, stock) => sum + (stock.etf.price * stock.quantity), 0),
    }));
    const totalPortfolioValue = portfolioValues.reduce((sum, p) => sum + p.value, 0);
    const totalTrades = tradeHistories.length;
    const totalChallenges = challengeInvitations.length;


    const userRolesData = [
        { name: "Admins", value: users.filter(u => u.role === "admin").length },
        { name: "Users", value: users.filter(u => u.role === "user").length },
    ];

    const portfolioBins = [
        { range: "0-10k", min: 0, max: 10000 },
        { range: "10k-50k", min: 10000, max: 50000 },
        { range: "50k-100k", min: 50000, max: 100000 },
        { range: ">100k", min: 100000, max: Infinity },
    ];
    
    const portfolioDistribution = portfolioBins.map(bin => ({
        range: bin.range,
        count: portfolioValues.filter(p => p.value >= bin.min && p.value < bin.max).length,
    }));

    const tradesByDate = tradeHistories.reduce((acc: Record<string, number>, trade) => {
        const date = new Date(trade.date).toLocaleDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});
    
    const tradesData = Object.entries(tradesByDate)
        .map(([date, count]) => ({ date, trades: count }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const challengeStatus = ["pending", "accepted", "declined"].map(status => ({
        status,
        count: challengeInvitations.filter(c => c.status === status).length,
    }));

    const balanceBins = [
        { range: "0-1k", min: 0, max: 1000 },
        { range: "1k-5k", min: 1000, max: 5000 },
        { range: "5k-10k", min: 5000, max: 10000 },
        { range: ">10k", min: 10000, max: Infinity },
    ];
    
    const balanceDistribution = balanceBins.map(bin => ({
        range: bin.range,
        count: balances.filter(b => b.amount >= bin.min && b.amount < bin.max).length,
    }));

    const xpBins = [
        { range: "0-100", min: 0, max: 100 },
        { range: "100-500", min: 100, max: 500 },
        { range: "500-1000", min: 500, max: 1000 },
        { range: ">1000", min: 1000, max: Infinity },
    ];
    
    const xpDistribution = xpBins.map(bin => ({
        range: bin.range,
        count: xps.filter(x => x.xp >= bin.min && x.xp < bin.max).length,
    }));

    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

    const displayedTrades = showAllTrades ? tradeHistories : tradeHistories.slice(0, 6);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container px-4 py-8 mx-auto">
            {/* Header */}
            <div className="flex items-center mb-8">
            <button 
                onClick={() => navigate('/')}
                className="flex items-center justify-center w-10 h-10 mr-4 transition-shadow bg-white rounded-full shadow-md hover:shadow-lg group"
            >
                <ArrowLeft className="w-5 h-5 transition-colors text-slate-600 group-hover:text-slate-900" />
            </button>
            <div>
                <h1 className="mb-2 text-4xl font-bold text-slate-900">Admin Dashboard</h1>
                <p className="text-slate-600">Comprehensive overview of system metrics and user data</p>
            </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-6 mb-12 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-6 transition-shadow bg-white border shadow-sm rounded-2xl border-slate-200 hover:shadow-md">
                <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                    <Users className="w-6 h-6 text-blue-600" />
                </div>
                </div>
                <h3 className="mb-1 text-sm font-medium text-slate-600">Total Users</h3>
                <p className="text-3xl font-bold text-slate-900">{totalUsers.toLocaleString()}</p>
            </div>
            
            <div className="p-6 transition-shadow bg-white border shadow-sm rounded-2xl border-slate-200 hover:shadow-md">
                <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-xl">
                    <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                </div>
                <h3 className="mb-1 text-sm font-medium text-slate-600">Portfolio Value</h3>
                <p className="text-3xl font-bold text-slate-900">${totalValue.toLocaleString()}</p>
            </div>
            
            <div className="p-6 transition-shadow bg-white border shadow-sm rounded-2xl border-slate-200 hover:shadow-md">
                <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                </div>
                <h3 className="mb-1 text-sm font-medium text-slate-600">Total Trades</h3>
                <p className="text-3xl font-bold text-slate-900">{totalTrades.toLocaleString()}</p>
            </div>
            
            <div className="p-6 transition-shadow bg-white border shadow-sm rounded-2xl border-slate-200 hover:shadow-md">
                <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                    <Trophy className="w-6 h-6 text-purple-600" />
                </div>
                </div>
                <h3 className="mb-1 text-sm font-medium text-slate-600">Challenges</h3>
                <p className="text-3xl font-bold text-slate-900">{totalChallenges.toLocaleString()}</p>
            </div>
            </div>

            {/* Data Tables Section */}
            <div className="mb-12 space-y-8">
            {/* Users Table */}
            <div className="overflow-hidden bg-white border shadow-sm rounded-2xl border-slate-200">
                <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="flex items-center text-xl font-semibold text-slate-900">
                    <Users className="w-5 h-5 mr-2 text-blue-600" />
                    Users ({totalUsers})
                </h2>
                </div>
                <div className="divide-y divide-slate-200">
                {users.map((user) => (
                    <div key={user._id} className="px-6 py-4 transition-colors hover:bg-slate-50">
                    <div className="flex items-center justify-between">
                        <div>
                        <h3 className="font-medium text-slate-900">{user.name}</h3>
                        <p className="text-sm text-slate-600">{user.email}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                        {user.role}
                        </span>
                    </div>
                    </div>
                ))}
                </div>
            </div>

            {/* Portfolios Table */}
            <div className="overflow-hidden bg-white border shadow-sm rounded-2xl border-slate-200">
                <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="flex items-center text-xl font-semibold text-slate-900">
                    <Activity className="w-5 h-5 mr-2 text-green-600" />
                    Portfolios ({portfolios.length})
                </h2>
                </div>
                <div className="divide-y divide-slate-200">
                {portfolios.map((portfolio) => (
                    <div key={portfolio._id} className="px-6 py-4 transition-colors hover:bg-slate-50">
                    <div className="mb-2">
                        <h3 className="font-medium text-slate-900">{portfolio.user.name}</h3>
                        <p className="text-sm text-slate-600">{portfolio.user.email}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {portfolio.stocks.map((stock, index) => (
                        <span key={index} className="px-2 py-1 text-xs rounded-md bg-slate-100 text-slate-700">
                            {stock.etf.symbol} ({stock.quantity})
                        </span>
                        ))}
                    </div>
                    </div>
                ))}
                </div>
            </div>

            {/* Trade Histories */}
            <div className="overflow-hidden bg-white border shadow-sm rounded-2xl border-slate-200">
                <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="flex items-center text-xl font-semibold text-slate-900">
                    <TrendingUp className="w-5 h-5 mr-2 text-orange-600" />
                    Trade Histories ({tradeHistories.length})
                </h2>
                </div>
                <div className="divide-y divide-slate-200">
                {displayedTrades.slice().reverse().map((trade) => (
                    <div key={trade._id} className="px-6 py-4 transition-colors hover:bg-slate-50">
                    <div className="flex items-center justify-between">
                        <div>
                        <h3 className="font-medium text-slate-900">{trade.user.name}</h3>
                        <p className="text-sm text-slate-600">{trade.user.email}</p>
                        </div>
                        <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            trade.action === 'BUY' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                            {trade.action}
                        </span>
                        <p className="mt-1 text-sm text-slate-600">
                            {new Date(trade.date).toLocaleDateString()}
                        </p>
                        </div>
                    </div>
                    </div>
                ))}
                </div>
                {tradeHistories.length > 6 && (
                <div className="px-6 py-4 border-t border-slate-200">
                    <button 
                    onClick={() => setShowAllTrades(!showAllTrades)}
                    className="flex items-center justify-center w-full py-2 text-sm font-medium transition-colors text-slate-600 hover:text-slate-900"
                    >
                    <ChevronDown className={`w-4 h-4 mr-1 transition-transform ${showAllTrades ? 'rotate-180' : ''}`} />
                    {showAllTrades ? 'Show Less' : 'Show More'}
                    </button>
                </div>
                )}
            </div>

            {/* Other sections with similar styling... */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Balances */}
                <div className="overflow-hidden bg-white border shadow-sm rounded-2xl border-slate-200">
                <div className="px-6 py-4 border-b border-slate-200">
                    <h2 className="flex items-center text-lg font-semibold text-slate-900">
                    <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                    Balances
                    </h2>
                </div>
                <div className="overflow-y-auto divide-y divide-slate-200 max-h-64">
                    {balances.map((balance) => (
                    <div key={balance._id} className="px-6 py-3 transition-colors hover:bg-slate-50">
                        <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-medium text-slate-900">{balance.user.name}</h4>
                        </div>
                        <span className="font-semibold text-green-600">
                            ${balance.amount.toLocaleString()}
                        </span>
                        </div>
                    </div>
                    ))}
                </div>
                </div>

                {/* XP */}
                <div className="overflow-hidden bg-white border shadow-sm rounded-2xl border-slate-200">
                <div className="px-6 py-4 border-b border-slate-200">
                    <h2 className="flex items-center text-lg font-semibold text-slate-900">
                    <Star className="w-5 h-5 mr-2 text-yellow-600" />
                    Experience Points
                    </h2>
                </div>
                <div className="overflow-y-auto divide-y divide-slate-200 max-h-64">
                    {xps.map((xp) => (
                    <div key={xp._id} className="px-6 py-3 transition-colors hover:bg-slate-50">
                        <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-medium text-slate-900">{xp.user.name}</h4>
                        </div>
                        <span className="font-semibold text-yellow-600">
                            {xp.xp.toLocaleString()} XP
                        </span>
                        </div>
                    </div>
                    ))}
                </div>
                </div>
            </div>
            </div>

            {/* Charts Section */}
            <div className="space-y-8">
            <h2 className="mb-6 text-2xl font-bold text-slate-900">Analytics & Insights</h2>
            
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* User Roles Distribution */}
                <div className="p-6 bg-white border shadow-sm rounded-2xl border-slate-200">
                <h3 className="mb-4 text-lg font-semibold text-slate-900">User Roles Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                    <Pie
                        data={userRolesData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label
                    >
                        {userRolesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                    </PieChart>
                </ResponsiveContainer>
                </div>

                {/* Portfolio Values Distribution */}
                <div className="p-6 bg-white border shadow-sm rounded-2xl border-slate-200">
                <h3 className="mb-4 text-lg font-semibold text-slate-900">Portfolio Values Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={portfolioDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="range" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip 
                        contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                        }} 
                    />
                    <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
                </div>

                {/* Trades Over Time */}
                <div className="p-6 bg-white border shadow-sm rounded-2xl border-slate-200">
                <h3 className="mb-4 text-lg font-semibold text-slate-900">Trades Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={tradesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip 
                        contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                        }} 
                    />
                    <Line 
                        type="monotone" 
                        dataKey="trades" 
                        stroke="#10B981" 
                        strokeWidth={3}
                        dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                    />
                    </LineChart>
                </ResponsiveContainer>
                </div>

                {/* Challenge Invitations Status */}
                <div className="p-6 bg-white border shadow-sm rounded-2xl border-slate-200">
                <h3 className="mb-4 text-lg font-semibold text-slate-900">Challenge Invitations Status</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={challengeStatus}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="status" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip 
                        contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                        }} 
                    />
                    <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
                </div>
            </div>

            {/* Additional Charts Row */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Balances Distribution */}
                <div className="p-6 bg-white border shadow-sm rounded-2xl border-slate-200">
                <h3 className="mb-4 text-lg font-semibold text-slate-900">Balances Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={balanceDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="range" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip 
                        contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                        }} 
                    />
                    <Bar dataKey="count" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
                </div>

                {/* XP Distribution */}
                <div className="p-6 bg-white border shadow-sm rounded-2xl border-slate-200">
                <h3 className="mb-4 text-lg font-semibold text-slate-900">XP Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={xpDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="range" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip 
                        contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                        }} 
                    />
                    <Bar dataKey="count" fill="#EF4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
                </div>
            </div>
            </div>
        </div>
        </div>
    );
};

export default AdminPanel;