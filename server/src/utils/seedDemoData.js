import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import connectDB from "../db/index.js";
import User from "../models/user.model.js";
import ETF from "../models/etf.model.js";
import Portfolio from "../models/portfolio.model.js";
import Balance from "../models/balance.model.js";
import TradeHistory from "../models/tradeHistory.model.js";
import XP from "../models/xp.model.js";
import Referral from "../models/referral.model.js";
import ChallengeInvitation from "../models/challengeInvitation.model.js";
import { faker } from "@faker-js/faker";

async function seedDemoData() {
  await connectDB();
  console.log("🔗 MongoDB Connected!");
  console.log("⚠️ Clearing existing data...");

  await Promise.all([
    User.deleteMany(),
    ETF.deleteMany(),
    Portfolio.deleteMany(),
    Balance.deleteMany(),
    TradeHistory.deleteMany(),
    XP.deleteMany(),
    Referral.deleteMany(),
    ChallengeInvitation.deleteMany(),
  ]);

  // ETFs
  console.log("🌐 Seeding ETFs...");
  const etfList = [
    { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', expenseRatio: 0.03, sector: 'Multiple', yearToDateReturn: 14.2, oneYearReturn: 18.5, aum: 700e9, expectedAnnualReturn: 8.5, annualVolatility: 12.1, price: 380.25 },
    { symbol: 'QQQ', name: 'Invesco QQQ Trust', expenseRatio: 0.20, sector: 'Technology', yearToDateReturn: 22.7, oneYearReturn: 30.1, aum: 200e9, expectedAnnualReturn: 10.2, annualVolatility: 15.4, price: 360.10 },
    { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', expenseRatio: 0.03, sector: 'Multiple', yearToDateReturn: 13.6, oneYearReturn: 17.8, aum: 250e9, expectedAnnualReturn: 8.0, annualVolatility: 11.8, price: 215.40 },
    { symbol: 'XLF', name: 'Financial Select Sector SPDR Fund', expenseRatio: 0.12, sector: 'Financials', yearToDateReturn: 8.4, oneYearReturn: 12.3, aum: 50e9, expectedAnnualReturn: 6.5, annualVolatility: 14.0, price: 38.75 },
    { symbol: 'GLD', name: 'SPDR Gold Shares', expenseRatio: 0.40, sector: 'Commodities', yearToDateReturn: 5.1, oneYearReturn: 4.7, aum: 60e9, expectedAnnualReturn: 5.0, annualVolatility: 16.8, price: 170.30 },
    { symbol: 'AGG', name: 'iShares Core U.S. Aggregate Bond ETF', expenseRatio: 0.04, sector: 'Bonds', yearToDateReturn: 3.2, oneYearReturn: 2.1, aum: 88e9, expectedAnnualReturn: 4.0, annualVolatility: 4.5, price: 110.50 },
    { symbol: 'VNQ', name: 'Vanguard Real Estate ETF', expenseRatio: 0.12, sector: 'Real Estate', yearToDateReturn: 6.8, oneYearReturn: 9.5, aum: 45e9, expectedAnnualReturn: 7.0, annualVolatility: 18.2, price: 100.75 },
    { symbol: 'XLK', name: 'Technology Select Sector SPDR Fund', expenseRatio: 0.10, sector: 'Technology', yearToDateReturn: 25.4, oneYearReturn: 32.0, aum: 45e9, expectedAnnualReturn: 11.0, annualVolatility: 16.0, price: 160.25 },
    { symbol: 'XLY', name: 'Consumer Discretionary Select Sector SPDR Fund', expenseRatio: 0.10, sector: 'Consumer Discretionary', yearToDateReturn: 18.0, oneYearReturn: 21.1, aum: 25e9, expectedAnnualReturn: 9.0, annualVolatility: 14.5, price: 155.60 },
    { symbol: 'XLI', name: 'Industrial Select Sector SPDR Fund', expenseRatio: 0.10, sector: 'Industrials', yearToDateReturn: 12.3, oneYearReturn: 15.8, aum: 20e9, expectedAnnualReturn: 7.5, annualVolatility: 13.2, price: 100.20 },
    { symbol: 'XLE', name: 'Energy Select Sector SPDR Fund', expenseRatio: 0.10, sector: 'Energy', yearToDateReturn: 9.5, oneYearReturn: 7.3, aum: 30e9, expectedAnnualReturn: 6.0, annualVolatility: 20.3, price: 85.40 },
    { symbol: 'EEM', name: 'iShares MSCI Emerging Markets ETF', expenseRatio: 0.68, sector: 'Emerging Markets', yearToDateReturn: 7.8, oneYearReturn: 10.2, aum: 30e9, expectedAnnualReturn: 8.0, annualVolatility: 18.0, price: 45.80 },
    { symbol: 'EFA', name: 'iShares MSCI EAFE ETF', expenseRatio: 0.32, sector: 'International', yearToDateReturn: 8.7, oneYearReturn: 11.5, aum: 70e9, expectedAnnualReturn: 7.0, annualVolatility: 15.0, price: 75.20 },
  ];
  const etfs = await ETF.insertMany(etfList);

  // Users
  console.log("🛡️ Seeding users...");

  const admin = await User.create({
    name: "Super Admin",
    email: "admin@test.com",
    password: "Admin@123",
    role: "admin",
  });
  await Balance.create({ user: admin._id, amount: 3_500 });
  await XP.create({ user: admin._id, xp: 5_000 });

  const specificUsers = await User.insertMany([
    { name: "Artur Mayslas", email: "artur@test.com", password: "User@123", role: "user" },
    { name: "Alex Enin", email: "alex@test.com", password: "User@123", role: "user" },
    { name: "Daniel Ladzhensky", email: "daniel@test.com", password: "User@123", role: "user" },
    { name: "Ilan Haifez", email: "ilan@test.com", password: "User@123", role: "user" },
  ]);

  for (const user of specificUsers) {
    await Balance.create({ user: user._id, amount: 3_500 });
    await XP.create({ user: user._id, xp: 5_000 });
  }

  const allUsers = [admin, ...specificUsers];
  const allUserIds = allUsers.map((u) => u._id);

  // Competitions
  console.log("🏆 Generating /data/competitions.data.js...");
  const compsDef = [
    { title: "April ETF Masters", start: "2025-04-01", end: "2025-04-30", prize: "Premium Account (1 Year)" },
    { title: "May Momentum Challenge", start: "2025-05-01", end: "2025-05-31", prize: "$1000 Cash Prize" },
    { title: "June Summer Showdown", start: "2025-06-01", end: "2025-06-30", prize: "Exclusive ETF Insights Report" },
    { title: "July Trading Contest", start: "2025-07-01", end: "2025-07-31", prize: "New Trading Laptop" },
  ];

  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
  const filepath = path.join(dataDir, "competitions.data.js");

  const competitions = await Promise.all(
    compsDef.map(async (c, idx) => {
      const sampled = faker.helpers.shuffle(allUserIds).slice(0, 5);
      const participants = await Promise.all(
        sampled.map(async (uid, i) => {
          const usr = allUsers.find((u) => u._id.equals(uid));
          const port = await Portfolio.findOne({ user: uid });
          const pv = port ? port.stocks.reduce((sum, s) => sum + s.quantity * s.price, 0) : 0;
          return {
            userId: uid.toString(),
            name: usr.name,
            portfolioValue: pv,
            rank: i + 1,
            investmentStrategy: faker.helpers.arrayElement(["conservative", "moderate", "aggressive"]),
            riskTolerance: faker.helpers.arrayElement(["low", "medium", "high"]),
          };
        })
      );

      return {
        id: String(idx + 1),
        title: c.title,
        startDate: c.start,
        endDate: c.end,
        participants,
        prize: c.prize,
        status: new Date(c.end) < new Date() ? "completed" : "upcoming",
      };
    })
  );

  fs.writeFileSync(
    filepath,
    "export const competitions = " + JSON.stringify(competitions, null, 2) + ";"
  );

  console.log("🎉 All demo data seeded & competitions.data.js created!");
  process.exit(0);
}

seedDemoData().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
