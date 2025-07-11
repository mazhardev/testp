import mongoose from "mongoose";

const PortfolioSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    stocks: [
      {
        etf: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ETF",
          required: true,
        },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
  },
  {
    timestamps: true, // optional but useful
  }
);

export default mongoose.model("Portfolio", PortfolioSchema);
