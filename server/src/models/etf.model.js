import mongoose from "mongoose";

const ETFSchema = new mongoose.Schema(
  {
    symbol: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    expenseRatio: { type: Number, required: true },
    sector: { type: String, required: true },
    yearToDateReturn: { type: Number, required: true },
    oneYearReturn: { type: Number, required: true },
    aum: { type: Number, required: true },
    expectedAnnualReturn: { type: Number, required: true },
    annualVolatility: { type: Number, required: true },
    price: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("ETF", ETFSchema);
