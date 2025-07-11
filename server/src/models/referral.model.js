import mongoose from "mongoose";

const ReferralSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  referredUsers: [{ type: String, required: true }],
});

export default mongoose.model("Referral", ReferralSchema);
