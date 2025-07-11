import { useState, useEffect } from "react";
import axios from "axios";
import { Trophy, Crown, Filter, Twitter, Facebook, Linkedin, Edit2, Check, X } from "lucide-react";
import ChallengeFriend from "./ChallengeFriend";
import ChallengeInvitations from "./ChallengeInvitations";

interface CompetitionsProps {
  token: string | null;
  userId: string | null;
}

export default function Competitions({ token, userId }: CompetitionsProps) {
  interface Competition {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    prize: string;
    status: string;
    participants: {
      userId: string;
      name: string;
      rank: number;
      investmentStrategy: string;
      riskTolerance: string;
      portfolioValue: number;
    }[];
  }

  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [strategyFilter, setStrategyFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Record<string, boolean>>({});
  const [nameInputs, setNameInputs] = useState<Record<string, string>>({});

  const uri = "http://ec2-44-212-51-157.compute-1.amazonaws.com:3000";
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [competitionsRes, friendsRes, challengesRes] = await Promise.all([
          axios.get(`${uri}/api/v1/competitions`),
          axios.get(`${uri}/api/v1/friends`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${uri}/api/v1/challenges/daily`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setCompetitions(competitionsRes.data.data);
        setFriends(friendsRes.data.data);
        setChallenges(challengesRes.data.data);
      } catch (err) {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  // Filter competitions
  const currentMonthCompetitions = competitions.filter(c => {
    const start = new Date(c.startDate);
    return start.getMonth() === currentMonth && start.getFullYear() === currentYear;
  });
  const previousCompetitions = competitions.filter(c => {
    const end = new Date(c.endDate);
    return end < now;
  });

  const handleShare = (platform: string, rank: number, totalParticipants: number) => {
    const message = `I'm ranked ${rank} out of ${totalParticipants} traders on WealthETF! Join me in building wealth through smart ETF investing. 📈`;
    const url = window.location.href;
    switch (platform) {
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}`);
        break;
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(message)}`);
        break;
      case "linkedin":
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(message)}`);
        break;
    }
  };

  const joinCompetition = async (competitionId: string) => {
    try {
      const res = await axios.post(
        `${uri}/api/v1/competitions/join`,
        { competitionId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCompetitions(prev =>
        prev.map(comp => (comp.id === competitionId ? res.data.data : comp))
      );
    } catch (err: any) {
      alert("Failed to join competition: " + (err.response?.data?.message || err.message));
    }
  };

  const handleEditClick = (userId: string, currentName: string) => {
    setEditing(e => ({ ...e, [userId]: true }));
    setNameInputs(n => ({ ...n, [userId]: currentName }));
  };

  const handleNameChangeLocal = (userId: string, value: string) => {
    setNameInputs(n => ({ ...n, [userId]: value }));
  };

  const handleSave = (competitionId: string, userId: string) => {
    const newName = nameInputs[userId];
    setCompetitions(prev =>
      prev.map(comp =>
        comp.id === competitionId
          ? { ...comp, participants: comp.participants.map(p => p.userId === userId ? { ...p, name: newName } : p) }
          : comp
      )
    );
    setEditing(e => ({ ...e, [userId]: false }));
  };

  const handleCancel = (userId: string) => {
    setEditing(e => ({ ...e, [userId]: false }));
  };

  if (loading) return <div>Loading competitions...</div>;
  if (error) return <div>Error: {error}</div>;

  const renderCompetition = (competition: Competition) => {
    const filtered = competition.participants.filter(p =>
      (strategyFilter === "all" || p.investmentStrategy === strategyFilter) &&
      (riskFilter === "all" || p.riskTolerance === riskFilter)
    );
    return (
      <div key={competition.id} className="p-6 bg-white border border-gray-200 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{competition.title}</h3>
            <p className="text-sm text-gray-500">
              {new Date(competition.startDate).toLocaleDateString()} - {new Date(competition.endDate).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Crown className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-gray-700">{competition.prize}</span>
          </div>
        </div>
        {filtered.length > 0 ? (
          <div className="space-y-2 overflow-y-auto max-h-96">
            {filtered.sort((a, b) => a.rank - b.rank).map((p, idx) => (
              <div key={p.userId} className="py-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      idx === 0 ? "bg-amber-100 text-amber-600" : idx === 1 ? "bg-gray-100 text-gray-600" : idx === 2 ? "bg-orange-100 text-orange-600" : "bg-gray-50 text-gray-500"
                    }`}>{p.rank}</span>
                    <div className="flex items-center space-x-2">
                      {editing[p.userId] ? (
                        <>
                          <input value={nameInputs[p.userId]} onChange={e => handleNameChangeLocal(p.userId, e.target.value)} className="px-2 py-1 text-sm text-gray-900 border border-gray-200 rounded-md" />
                          <button onClick={() => handleSave(competition.id, p.userId)}><Check className="w-4 h-4 text-green-500 hover:text-green-600" /></button>
                          <button onClick={() => handleCancel(p.userId)}><X className="w-4 h-4 text-red-500 hover:text-red-600" /></button>
                        </>
                      ) : (
                        <>
                          <span className="px-2 py-1 text-sm text-gray-900">{p.name}</span>
                          <button onClick={() => handleEditClick(p.userId, p.name)}><Edit2 className="w-4 h-4 text-gray-400 hover:text-gray-600" /></button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-700">${p.portfolioValue.toLocaleString()}</span>
                    {p.userId === userId && (
                      <div className="flex space-x-2">
                        <button onClick={() => handleShare("twitter", p.rank, competition.participants.length)} className="p-1.5 text-blue-400 hover:bg-blue-50 rounded-full transition-colors"><Twitter className="w-4 h-4" /></button>
                        <button onClick={() => handleShare("facebook", p.rank, competition.participants.length)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"><Facebook className="w-4 h-4" /></button>
                        <button onClick={() => handleShare("linkedin", p.rank, competition.participants.length)} className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-full transition-colors"><Linkedin className="w-4 h-4" /></button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex mt-1 space-x-2 px-9">
                  <span className="px-2 py-1 text-xs text-indigo-600 rounded-full bg-indigo-50">{p.investmentStrategy}</span>
                  <span className="px-2 py-1 text-xs rounded-full bg-amber-50 text-amber-600">{p.riskTolerance} risk</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center">
            <p className="text-sm text-gray-500">No participants match the selected filters</p>
            {competition.status === "upcoming" && <button onClick={() => joinCompetition(competition.id)} className="px-4 py-2 mt-2 text-white transition-colors bg-indigo-500 rounded-md hover:bg-indigo-600">Join Competition</button>}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <ChallengeInvitations token={token} />

      <div className="p-6 border rounded-lg shadow-md bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100">
        <div className="flex items-center mb-4 space-x-3">
          <Trophy className="w-6 h-6 text-amber-500" />
          <h2 className="text-xl font-semibold text-gray-900">Trading Competitions</h2>
        </div>
        <p className="text-gray-700">Compete with other traders, showcase your skills, and win exciting prizes!</p>
      </div>

      <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-md">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <div className="flex flex-col w-full space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
            <select value={strategyFilter} onChange={e => setStrategyFilter(e.target.value)} className="...">
              <option value="all">All Strategies</option>
              <option value="aggressive">Aggressive</option>
              <option value="moderate">Moderate</option>
              <option value="conservative">Conservative</option>
            </select>
            <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)} className="...">
              <option value="all">All Risk Levels</option>
              <option value="high">High Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="low">Low Risk</option>
            </select>
          </div>
        </div>
      </div>

      {/* Current Month Competitions */}
      {currentMonthCompetitions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Current Month Competitions</h3>
          {currentMonthCompetitions.map(renderCompetition)}
        </div>
      )}

      {/* Previous Competitions */}
      {previousCompetitions.length > 0 && (
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-semibold">Previous Competitions</h3>
          {previousCompetitions.map(renderCompetition)}
        </div>
      )}
          <ChallengeFriend friends={friends} challenges={challenges} token={token} />
    </div>
  );
}
