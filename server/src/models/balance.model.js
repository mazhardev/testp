import mongoose from "mongoose";

const BalanceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    amount: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Balance", BalanceSchema);
