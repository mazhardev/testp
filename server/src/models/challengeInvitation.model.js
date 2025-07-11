import mongoose from "mongoose";

const ChallengeInvitationSchema = new mongoose.Schema(
    {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        challengeId: { type: String, required: true },
        status: { type: String, enum: ["pending", "accepted", "declined"], default: "pending" },
    },
    { timestamps: true }
);

export default mongoose.model("ChallengeInvitation", ChallengeInvitationSchema);