import { useState, useEffect } from "react";
import axios from "axios";

interface ChallengeInvitation {
    _id: string;
    sender: { name: string };
    challengeId: string;
    status: string;
}

    interface ChallengeInvitationsProps {
    token: string | null;
    }

    export default function ChallengeInvitations({ token }: ChallengeInvitationsProps) {
    const [invitations, setInvitations] = useState<ChallengeInvitation[]>([]);
    const uri = "http://ec2-44-212-51-157.compute-1.amazonaws.com:3000";

    useEffect(() => {
        const fetchInvitations = async () => {
        try {
            const res = await axios.get(`${uri}/api/v1/friends/challenge/invitations`, {
            headers: { Authorization: `Bearer ${token}` },
            });
            setInvitations(res.data.data);
        } catch (error) {
            console.error("Error fetching invitations:", error);
        }
        };
        if (token) fetchInvitations();
    }, [token]);

    const handleRespond = async (invitationId: string, status: "accepted" | "declined") => {
        console.log("Sending response for invitationId:", invitationId);
        try {
        await axios.post(
            `${uri}/api/v1/friends/challenge/respond`,
            { invitationId, status },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        setInvitations((prev) =>
            prev.map((inv) => (inv._id === invitationId ? { ...inv, status } : inv))
        );
        } catch (error) {
        console.error("Error responding to challenge:", error);
        alert("Failed to respond to challenge.");
        }
    };

    return (
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-md">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Challenge Invitations</h3>
        {invitations.length === 0 ? (
            <p className="text-sm text-gray-500">No pending invitations</p>
        ) : (
            invitations.map((invitation) => (
                <div key={invitation._id} className="flex items-center justify-between py-2">
                    <div>
                        <p className="text-sm text-gray-900">
                        {invitation.sender.name} challenged you to: {invitation.challengeId}
                        </p>
                        {invitation.status === "pending" && (
                        <div className="flex mt-2 space-x-2">
                            <button
                            onClick={() => handleRespond(invitation._id, "accepted")}
                            className="px-3 py-1 text-white bg-green-500 rounded-md hover:bg-green-600"
                            >
                            Accept
                            </button>
                            <button
                            onClick={() => handleRespond(invitation._id, "declined")}
                            className="px-3 py-1 text-white bg-red-500 rounded-md hover:bg-red-600"
                            >
                            Decline
                            </button>
                        </div>
                        )}
                        {invitation.status !== "pending" && (
                        <p className="text-sm text-gray-500">Status: {invitation.status}</p>
                        )}
                    </div>
                    </div>
                ))
        )}
        </div>
    );
    }