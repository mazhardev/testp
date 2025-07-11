import mongoose from "mongoose";

const TradeHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: { type: Date, default: Date.now },
  action: { type: String, enum: ["buy", "sell"], required: true },
});

export default mongoose.model("TradeHistory", TradeHistorySchema);
