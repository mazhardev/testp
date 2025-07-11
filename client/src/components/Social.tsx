import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Users,
  Mail,
  Rocket,
  PieChart,
  Medal,
  Star,
  Target,
  Zap,
  Trophy,
} from "lucide-react";
import { jwtDecode } from "jwt-decode"; // Import jwt-decode

interface SocialProps {
  token: string | null;
}

interface DecodedToken {
  userId: string; // Adjust based on your token's payload
  exp: number;
}

export default function Social({ token }: SocialProps) {
  interface Friend {
    id: string;
    name: string;
    avatar: string;
    portfolioValue: number;
    status: string;
    lastActive: string;
  }

  const [friends, setFriends] = useState<Friend[]>([]);
  interface DailyChallenge {
    id: string;
    title: string;
    description: string;
    reward: number;
    progress: number;
    target: number;
    completed: boolean;
  }

  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([]);
  interface Achievement {
    id: string;
    title: string;
    description: string;
    reward: number;
    progress: number;
    maxProgress: number;
    unlocked: boolean;
    icon: string;
  }

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);

  const uri = "http://ec2-44-212-51-157.compute-1.amazonaws.com:3000";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [friendsRes, achievementsRes, challengesRes] = await Promise.all([
          axios.get(`${uri}/api/v1/friends`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${uri}/api/v1/achievements`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${uri}/api/v1/challenges/daily`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // Decode token to get current user ID
        let currentUserId = "";
        if (token) {
          try {
            const decoded: DecodedToken = jwtDecode(token);
            currentUserId = decoded.userId;
          } catch (decodeError) {
            console.error("Error decoding token:", decodeError);
          }
        }

        // Update friends list to set current user's status to "online"
        const updatedFriends = friendsRes.data.data.map((friend: Friend) => {
          if (friend.id === currentUserId) {
            return { ...friend, status: "online" };
          }
          return friend;
        });

        setFriends(updatedFriends);
        setAchievements(achievementsRes.data.data);
        setDailyChallenges(challengesRes.data.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch social data");
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inviteEmail || !inviteEmail.trim()) {
      alert("Please enter a valid email address");
      return;
    }

    setInviting(true);

    try {
      const response = await axios.post(
        `${uri}/api/v1/friends/invite`,
        { email: inviteEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200 || response.status === 201) {
        alert(`Invitation sent to ${inviteEmail}`);
        setInviteEmail("");
      } else {
        throw new Error("Server returned an unexpected status");
      }
    } catch (err) {
      console.error("Invitation error:", err);
      alert("Failed to send invitation. Please try again.");
    } finally {
      setInviting(false);
    }
  };

  const iconMap: { [key: string]: React.ElementType } = {
    Rocket,
    Users,
    Trophy,
    PieChart,
  };

  if (loading) return <div>Loading social data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-8">
      {/* Daily Challenges Section */}
      <div className="p-6 border rounded-lg shadow-md bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 border-amber-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              Daily Challenges
            </h2>
          </div>
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-amber-100 rounded-full">
            <Zap className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-700">
              120 XP Available
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <div className="flex pb-2 space-x-4 overflow-x-scroll snap-x snap-mandatory">
            {dailyChallenges.map((challenge) => (
              <div
                key={challenge.id}
                className={`snap-start shrink-0 w-[90%] sm:w-[60%] md:w-[30%] p-4 rounded-lg border transition-all duration-300 ${
                  challenge.completed
                    ? "bg-white border-amber-200 shadow-sm"
                    : "bg-white/50 border-amber-100"
                } shadow-md`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-900">
                    {challenge.title}
                  </h3>
                  <span className="px-2 py-1 text-xs font-medium rounded-full text-amber-600 bg-amber-50">
                    +{challenge.reward} XP
                  </span>
                </div>
                <p className="mb-3 text-xs text-gray-600">
                  {challenge.description}
                </p>
                <div className="space-y-2">
                  <div className="h-1.5 w-full bg-amber-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        challenge.completed ? "bg-amber-500" : "bg-amber-300"
                      }`}
                      style={{
                        width: `${
                          (challenge.progress / challenge.target) * 100
                        }%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {challenge.progress}/{challenge.target}
                    </span>
                    {challenge.completed && <span>Completed!</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="p-6 border border-indigo-100 rounded-lg shadow-md bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="flex items-center mb-6 space-x-2">
          <Medal className="w-5 h-5 text-indigo-500" />
          <h2 className="text-lg font-semibold text-gray-900">
            Your Achievements
          </h2>
        </div>
        <div className="overflow-x-auto">
          <div className="flex pb-2 space-x-4 overflow-x-scroll snap-x snap-mandatory">
            {achievements.map((achievement) => {
              const Icon = iconMap[achievement.icon] || Star;
              return (
                <div
                  key={achievement.id}
                  className={`snap-start shrink-0 w-[90%] sm:w-[60%] md:w-[30%] p-4 rounded-lg border transition-all duration-300 ${
                    achievement.unlocked
                      ? "bg-white border-indigo-200 shadow-sm"
                      : "bg-gray-50 border-gray-200"
                  } shadow-md`}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={`p-2 rounded-lg ${
                        achievement.unlocked ? "bg-indigo-100" : "bg-gray-100"
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 ${
                          achievement.unlocked
                            ? "text-indigo-600"
                            : "text-gray-400"
                        }`}
                      />
                    </div>
                    {achievement.unlocked && (
                      <span className="px-2 py-1 text-xs font-medium text-indigo-600 rounded-full bg-indigo-50">
                        +{achievement.reward} XP
                      </span>
                    )}
                  </div>
                  <h3
                    className={`mt-4 text-sm font-medium ${
                      achievement.unlocked ? "text-gray-900" : "text-gray-600"
                    }`}
                  >
                    {achievement.title}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    {achievement.description}
                  </p>
                  <div className="mt-3">
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          achievement.unlocked
                            ? "bg-indigo-500"
                            : "bg-indigo-200"
                        }`}
                        style={{
                          width: `${
                            (achievement.progress / achievement.maxProgress) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-right text-gray-500">
                      {achievement.progress}/{achievement.maxProgress}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Friends Section */}
      <div className="p-6 mt-8 bg-white border border-gray-200 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-semibold text-gray-900">Friends</h2>
          </div>
          <form onSubmit={handleInvite} className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <input
              type="email"
              placeholder="friend@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 sm:w-auto"
              required
            />
            <button
              type="submit"
              disabled={inviting}
              className={`flex items-center px-4 py-2 space-x-2 text-white transition-colors rounded-md ${
                inviting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-500 hover:bg-indigo-600"
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>{inviting ? "Sending..." : "Invite"}</span>
            </button>
          </form>
        </div>
        <div className="overflow-y-auto divide-y divide-gray-100 max-h-96">
          {friends.length > 0 ? (
            friends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center justify-between py-4"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={friend.avatar}
                    alt={friend.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {friend.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Portfolio: ${friend.portfolioValue.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      friend.status === "online" ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                  <span className="text-sm text-gray-500">
                    {friend.status === "online" ? "Online" : friend.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-6 text-center text-gray-500">
              No friends yet. Invite someone to get started!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}