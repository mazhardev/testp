import { useState } from "react";
import axios from "axios";
import { UserPlus, ChevronDown } from "lucide-react";

interface Friend {
    id: string;
    name: string;
    avatarUrl?: string;
    }

    interface Challenge {
    id: string;
    title: string;
    }

    interface ChallengeFriendProps {
    friends: Friend[];
    challenges: Challenge[];
    token: string | null;
    }

    export default function ChallengeFriend({ friends, challenges, token }: ChallengeFriendProps) {
    const [selectedFriend, setSelectedFriend] = useState<string>("");
    const [selectedChallenge, setSelectedChallenge] = useState<string>("");
    const [sending, setSending] = useState<boolean>(false);
    const uri = "http://localhost:3000";

    const handleSendChallenge = async () => {
        if (!token) {
        alert("Please log in to send a challenge.");
        return;
        }
        if (!selectedFriend || !selectedChallenge) {
        alert("Select both a friend and a challenge.");
        return;
        }
        setSending(true);
        try {
        await axios.post(
            `${uri}/api/v1/friends/challenge`,
            { recipientId: selectedFriend, challengeId: selectedChallenge },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Challenge sent!");
        setSelectedFriend("");
        setSelectedChallenge("");
        } catch (err) {
        console.error(err);
        alert("Oops! Could not send the challenge.");
        } finally {
        setSending(false);
        }
    };

    return (
        <div className="p-6 bg-white border border-gray-200 shadow-lg rounded-2xl">
        <div className="flex items-center mb-4">
            <UserPlus className="w-6 h-6 mr-2 text-indigo-600" />
            <h3 className="text-xl font-semibold text-gray-800">Challenge a Friend</h3>
        </div>
        <div className="space-y-6">
            {/* Friend Selector */}
            <div>
            <label htmlFor="friend-select" className="block mb-1 text-sm font-medium text-gray-700">
                Select Friend
            </label>
            <div className="relative">
                <select
                id="friend-select"
                value={selectedFriend}
                onChange={(e) => setSelectedFriend(e.target.value)}
                className="w-full px-4 py-2 pr-10 bg-white border border-gray-300 rounded-lg shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                <option value="">-- Choose friend --</option>
                {friends.map((f) => (
                    <option key={f.id} value={f.id}>
                    {f.name}
                    </option>
                ))}
                </select>
                <ChevronDown className="absolute w-4 h-4 -mt-2 text-gray-400 pointer-events-none top-1/2 right-3" />
            </div>
            </div>

            {/* Challenge Selector */}
            <div>
            <label htmlFor="challenge-select" className="block mb-1 text-sm font-medium text-gray-700">
                Select Challenge
            </label>
            <div className="relative">
                <select
                id="challenge-select"
                value={selectedChallenge}
                onChange={(e) => setSelectedChallenge(e.target.value)}
                className="w-full px-4 py-2 pr-10 bg-white border border-gray-300 rounded-lg shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                <option value="">-- Choose challenge --</option>
                {challenges.map((c) => (
                    <option key={c.id} value={c.id}>
                    {c.title}
                    </option>
                ))}
            </select>
            <ChevronDown className="absolute w-4 h-4 -mt-2 text-gray-400 pointer-events-none top-1/2 right-3" />
            </div>
            </div>

            {/* Send Button */}
            <button
            onClick={handleSendChallenge}
            disabled={sending}
            className="flex items-center justify-center w-full px-5 py-3 font-medium text-white transition-colors bg-indigo-600 rounded-lg shadow hover:bg-indigo-700 disabled:opacity-50"
            >
            {sending ? 'Sending...' : 'Send Challenge'}
            </button>
        </div>
        </div>
    );
}
