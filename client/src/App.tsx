import { useState, useEffect } from "react";
import { BarChart3, Calculator, LineChart, Settings, HelpCircle, ChevronRight, Wallet, Users, Trophy, AlertCircle } from "lucide-react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Link } from "react-router-dom";
import { Shield } from "lucide-react";
import Portfolio from "./components/Portfolio";
import Overview from "./components/Overview";
import UserProfile from "./components/UserProfile";
import ETFSelector from "./components/ETFSelector";
import Social from "./components/Social";
import Competitions from "./components/Competitions";
import RetirementCalculator from "./components/RetirementCalculator";
import Login from "./components/Login";
import Register from "./components/Register";
import { RetirementInputs } from "./types";
import AdminPanel from "./components/Admin";
import api from "./utils/api.ts"



const navItems = [
  { icon: BarChart3, label: "Overview", id: "dashboard" },
  { icon: Calculator, label: "Calculator", id: "calculator" },
  { icon: LineChart, label: "Portfolio", id: "portfolio" },
  { icon: Users, label: "Social", id: "social" },
  { icon: Trophy, label: "Competitions", id: "competitions" },
  { icon: Settings, label: "Settings", id: "settings" },
  { icon: HelpCircle, label: "Help", id: "help" },
];

function App() {
  const [activeTab, setActiveTab] = useState("calculator");
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [name, setName] = useState(localStorage.getItem("name") || "");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [inputs, setInputs] = useState<RetirementInputs>({
    currentAge: 30,
    retirementAge: 65,
    currentSavings: 50000,
    monthlyContribution: 1000,
    desiredRetirementIncome: 80000,
    selectedETF: "VTI",
    inflationRate: 2.5,
  });
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(localStorage.getItem("userId"));
  const [userProgress, setUserProgress] = useState(null);
  const [etfs, setEtfs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accountBalance, setAccountBalance] = useState<number>(0);

  // const uri = "http://localhost:3000";
   const uri = "http://ec2-44-212-51-157.compute-1.amazonaws.com:3000";

  const handleLogin = (newToken: string, newName: string, newUserId: string) => {
    setToken(newToken);
    setName(newName);
    setUserId(newUserId);
    localStorage.setItem("token", newToken);
    localStorage.setItem("name", newName);
    localStorage.setItem("userId", newUserId);
  };


  const handleLogout = async () => {
    try {
      await api.post(`${uri}/api/v1/user/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Failed during logout:", err);
    } finally {
      setToken(null);
      setName("");
      setUserId(null);
      setUserRole(null);
      localStorage.removeItem("token");
      localStorage.removeItem("name");
      localStorage.removeItem("userId");
      window.location.href = "/login";
    }
  };

  useEffect(() => {
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          handleLogout();
        } else {
          setUserRole(decoded.role);
        }
      } catch (error) {
        console.error("Invalid token", error);
        setUserRole(null);
        handleLogout();
      }
    } else {
      setUserRole(null);
    }
  }, [token]);

  const fetchPortfolio = async () => {
    try {
      const res = await api.get(`${uri}/api/v1/portfolio/myholdings`, { headers: { Authorization: `Bearer ${token}` } });
      setPortfolio(res.data.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        handleLogout();
      } else {
        console.error("Failed to fetch portfolio");
      }
    }
  };

  useEffect(() => {
    if (token) {
      const fetchData = async () => {
        try {
          const [portfolioRes, balanceRes, userProgressRes, etfsRes] = await Promise.all([
            api.get('/api/v1/portfolio/myholdings', { headers: { Authorization: `Bearer ${token}` } }),
            api.get('/api/v1/portfolio/balance', { headers: { Authorization: `Bearer ${token}` } }),
            api.get('/api/v1/user/progress', { headers: { Authorization: `Bearer ${token}` } }),
            api.get('/api/v1/portfolio/etfs'),
          ]);
          if (portfolioRes) setPortfolio(portfolioRes.data.data);
          setAccountBalance(balanceRes.data.data);
          setUserProgress(userProgressRes?.data?.data || { streak: 0, level: 1, currentXP: 0, xpToNextLevel: 100 });
          if (etfsRes) setEtfs(etfsRes.data.data);
          setLoading(false);
        } catch (err) {
          setError("Failed to fetch initial data. Please try again.");
          setLoading(false);
        }
      };
      fetchData();
    } else {
      setLoading(false);
    }
  }, [token]);

  const handleInputChange = (newInputs: Partial<RetirementInputs>) => {
    setInputs((prev) => ({ ...prev, ...newInputs }));
  };

  const MainApp = (
    <div className="flex flex-col min-h-screen bg-gray-50 lg:flex-row">
      <div className="w-full bg-white border-b border-gray-100 shadow-lg lg:w-64 lg:border-b-0 lg:border-r lg:min-h-screen">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b lg:p-6 border-gray-50">
            <div className="flex items-center space-x-2">
              <Wallet className="w-6 h-6 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">WealthETF</span>
            </div>
          </div>
          <nav className="flex-1 overflow-x-auto">
            <ul className="flex px-3 py-2 space-x-2 lg:flex-col lg:space-x-0 lg:space-y-2 min-w-max">
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all w-full ${activeTab === item.id ? "bg-indigo-100 text-indigo-700 font-medium" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      } lg:px-4 lg:py-3 lg:text-sm`}
                  >
                    <div className="flex items-center">
                      <item.icon className="w-5 h-5 mr-3" />
                      <span className="hidden lg:inline">{item.label}</span>
                    </div>
                    {activeTab === item.id && <ChevronRight className="hidden w-4 h-4 lg:block" />}
                  </button>
                </li>
              ))}
              {userRole === "admin" && (
                <li>
                  <Link
                    to="/admin"
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all w-full text-gray-600 hover:bg-gray-100 hover:text-gray-900 lg:px-4 lg:py-3 lg:text-sm"
                  >
                    <div className="flex items-center">
                      <Shield className="w-5 h-5 mr-3" />
                      <span className="hidden lg:inline">Admin</span>
                    </div>
                  </Link>
                </li>
              )}
            </ul>
          </nav>
          <div className="hidden p-6 m-5 border shadow-md rounded-xl lg:block bg-gradient-to-br from-indigo-50 to-white border-indigo-100/50">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-full">
                <span className="text-sm font-medium text-indigo-600">{name ? name.slice(0, 2).toUpperCase() : "JD"}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{name || "Guest"}</p>
                <p className="text-xs text-gray-500">Premium Plan</p>
              </div>
            </div>
            <button onClick={handleLogout} className="mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline">Logout</button>
          </div>
        </div>
      </div>
      <div className="flex-1 w-full overflow-auto">
        <div className="p-4 bg-white border-b border-gray-100 shadow-md lg:px-8 lg:py-4">
          <div className="flex justify-end">
            <UserProfile
              portfolio={portfolio}
              userProgress={userProgress}
              etfs={etfs}
              name={name}
              accountBalance={accountBalance}
              onLogout={handleLogout}
            />
          </div>
        </div>
        <div className="p-4 lg:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{navItems.find((item) => item.id === activeTab)?.label}</h1>
          </div>
          {activeTab === "dashboard" && <Overview inputs={inputs} onEditInputs={() => setActiveTab("calculator")} etfs={etfs} />}
          {activeTab === "calculator" && (
            <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
              <div className="p-6 bg-white border border-gray-200 shadow-lg rounded-xl">
                <h2 className="mb-6 text-xl font-semibold text-gray-900">Select Your ETF</h2>
                <ETFSelector onSelect={(symbol) => handleInputChange({ selectedETF: symbol })} selectedETF={inputs.selectedETF} etfs={etfs} />
              </div>
              <div>
                <h2 className="mb-6 text-xl font-semibold text-gray-900">Calculate Your Retirement</h2>
                <RetirementCalculator inputs={inputs} onInputChange={handleInputChange} etfs={etfs} />
              </div>
            </div>
          )}
          {activeTab === "portfolio" && <Portfolio portfolio={portfolio} setPortfolio={setPortfolio} etfs={etfs} token={token} fetchPortfolio={fetchPortfolio} setAccountBalance={setAccountBalance} />}
          {activeTab === "competitions" && <Competitions token={token} userId={userId} />}
          {activeTab === "social" && <Social token={token} />}
          {activeTab !== "calculator" && activeTab !== "social" && activeTab !== "portfolio" && activeTab !== "competitions" && activeTab !== "dashboard" && (
            <div className="p-6 bg-white border border-gray-200 shadow-lg rounded-xl">
              <p className="text-gray-500">This feature is coming soon!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) return (
    <div className="flex items-center justify-center h-screen text-indigo-700">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-indigo-200 rounded-full border-t-indigo-600 animate-spin"></div>
        <p className="mt-4 font-medium">Loading your dashboard...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-screen">
      <div className="max-w-md p-6 text-center border border-red-100 bg-red-50 rounded-xl">
        <AlertCircle className="w-10 h-10 mx-auto mb-4 text-red-500" />
        <p className="font-medium text-red-600">{error}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 mt-4 text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700">Retry</button>
      </div>
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={token ? MainApp : <Navigate to="/login" />} />
        <Route path="/admin" element={token && userRole === "admin" ? <AdminPanel portfolio={portfolio} etfs={etfs} /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;