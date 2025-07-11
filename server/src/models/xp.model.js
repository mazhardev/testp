import mongoose from "mongoose";

const XPSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    xp: { type: Number, required: true },
    firstTradeRewardedAt: { type: Date },
    thirdTradeRewardedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("XP", XPSchema);
