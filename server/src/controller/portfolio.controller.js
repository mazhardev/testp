import { etfs } from "../../data/etf.data.js";
import ETF from "../models/etf.model.js";
import Balance from "../models/balance.model.js";
import Portfolio from "../models/portfolio.model.js";
import TradeHistory from "../models/tradeHistory.model.js";
import XP from "../models/xp.model.js";
import { userPortfolio } from "../../data/portfolio.data.js";

const getETFs = async (req, res) => {
  try {
    const etfData = await ETF.find({});
    if (etfData.length === 0) {
      return res.status(404).json({ message: "No ETFs found" });
    }
    return res.status(200).json({ data: etfData });
  } catch (error) {
    console.error("Error fetching ETFs:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const addETFs = async (req, res) => {
  try {
    const etfData = req.body;

    // Support for single ETF or array of ETFs
    const result = Array.isArray(etfData)
      ? await ETF.insertMany(etfData)
      : await ETF.create(etfData);

      return res.status(201).json({
      message: "ETF(s) added successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error adding ETF(s):", error);
    res.status(500).json({
      message: "Failed to add ETF(s)",
      error: error.message,
    });
  }
};

const buyETFs = async (req, res) => {
  try {
    const { etfId, quantity } = req.body;
    if (!etfId || !quantity) {
      return res.status(400).json({ message: "Invalid request" });
    }
    const etf = await ETF.findById(etfId);
    if (!etf) {
      return res.status(404).json({ message: "ETF not found" });
    }
    const price = etf.price;
    const totalCost = quantity * price;
    const userBalance = await Balance.findOne({ user: req.user.id });
    if (totalCost > userBalance.amount) {
      return res.status(400).json({ message: "Insufficient funds" });
    }
    let portfolio = await Portfolio.findOne({ user: req.user.id });
    if (!portfolio) {
      portfolio = await Portfolio.create({
        user: req.user.id,
        stocks: [{ etf: etfId, quantity, price }],
      });
    } else {
      const existingStock = portfolio.stocks.find(
        (s) => s.etf.toString() === etfId
      );

      if (existingStock) {
        // Weighted average price calculation
        const totalQuantity = existingStock.quantity + quantity;
        existingStock.price =
          (existingStock.quantity * existingStock.price + quantity * price) /
          totalQuantity;
        existingStock.quantity = totalQuantity;
      } else {
        portfolio.stocks.push({ etf: etfId, quantity, price });
      }

      await portfolio.save();
    }

    userBalance.amount -= totalCost;
    await userBalance.save();

    await TradeHistory.create({
      user: req.user.id,
      date: new Date(),
      action: "buy",
    });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const tradeCount = await TradeHistory.countDocuments({
      user: req.user.id,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    const xpRecord = await XP.findOne({ user: req.user.id });
    const now = new Date();

    let updates = {};
    let xpToAdd = 0;

    // First trade of the day
    if (
      tradeCount === 1 &&
      (!xpRecord ||
        !xpRecord.firstTradeRewardedAt ||
        xpRecord.firstTradeRewardedAt < startOfDay)
    ) {
      xpToAdd += 30;
      updates.firstTradeRewardedAt = now;
    }

    // Exactly 3 trades of the day
    if (
      tradeCount === 3 &&
      (!xpRecord ||
        !xpRecord.thirdTradeRewardedAt ||
        xpRecord.thirdTradeRewardedAt < startOfDay)
    ) {
      xpToAdd += 50;
      updates.thirdTradeRewardedAt = now;
    }

    if (xpToAdd > 0) {
      await XP.findOneAndUpdate(
        { user: req.user.id },
        {
          $inc: { xp: xpToAdd },
          $set: updates,
        },
        { upsert: true, new: true }
      );
    }
    return res.status(200).json({
      message: "ETF(s) bought successfully",
      data: {
        etfId,
        quantity,
        totalCost,
        remainingBalance: userBalance.amount,
      },
    });
  } catch (error) {
    console.error("Error buying ETF(s):", error);
    res.status(500).json({
      message: "Failed to buy ETF(s)",
      error: error.message,
    });
  }
};

const sellETFs = async (req, res) => {
  const { etfId, quantity } = req.body;
  if (!etfId || !quantity) {
    return res.status(400).json({ message: "Invalid request" });
  }
  try {
    const etf = await ETF.findById(etfId);
    if (!etf) {
      return res.status(404).json({ message: "ETF not found" });
    }
    const price = etf.price;
    const totalCost = quantity * price;
    let portfolio = await Portfolio.findOne({ user: req.user.id });
    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found" });
    }
    const existingStock = portfolio.stocks.find(
      (s) => s.etf.toString() === etfId
    );
    if (!existingStock || existingStock.quantity < quantity) {
      return res.status(400).json({ message: "Insufficient shares" });
    }
    existingStock.quantity -= quantity;
    if (existingStock.quantity === 0) {
      portfolio.stocks = portfolio.stocks.filter(
        (s) => s.etf.toString() !== etfId
      );
    }
    await portfolio.save();

    const userBalance = await Balance.findOne({ user: req.user.id });
    userBalance.amount += totalCost;
    await userBalance.save();

    await TradeHistory.create({
      user: req.user.id,
      date: new Date(),
      action: "sell",
    });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const tradeCount = await TradeHistory.countDocuments({
      user: req.user.id,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    const xpRecord = await XP.findOne({ user: req.user.id });
    const now = new Date();

    let updates = {};
    let xpToAdd = 0;

    // First trade of the day
    if (
      tradeCount === 1 &&
      (!xpRecord ||
        !xpRecord.firstTradeRewardedAt ||
        xpRecord.firstTradeRewardedAt < startOfDay)
    ) {
      xpToAdd += 30;
      updates.firstTradeRewardedAt = now;
    }

    // Exactly 3 trades of the day
    if (
      tradeCount === 3 &&
      (!xpRecord ||
        !xpRecord.thirdTradeRewardedAt ||
        xpRecord.thirdTradeRewardedAt < startOfDay)
    ) {
      xpToAdd += 50;
      updates.thirdTradeRewardedAt = now;
    }

    if (xpToAdd > 0) {
      await XP.findOneAndUpdate(
        { user: req.user.id },
        {
          $inc: { xp: xpToAdd },
          $set: updates,
        },
        { upsert: true, new: true }
      );
    }
    return res.status(200).json({
      message: "ETF(s) sold successfully",
      data: {
        etfId,
        quantity,
        totalCost,
        remainingBalance: userBalance.amount,
      },
    });
  } catch (error) {
    console.error("Error selling ETF(s):", error);
    res.status(500).json({
      message: "Failed to sell ETF(s)",
      error: error.message,
    });
  }
};

const getMyHoldings = async (req, res) => {
  try {
    const portfolio = await Portfolio
      .findOne({ user: req.user.id })
      .populate("stocks.etf");
    if (!portfolio) {
      return res.status(200).json({ data: [] });
    }
    return res.status(200).json({ data: portfolio.stocks });
  } catch (error) {
    console.error("Error fetching portfolio:", error);
    return res.status(500).json({
      message: "Failed to fetch portfolio",
      error: error.message,
    });
  }
};

const getBalance = async (req, res) => {
  try {
    const balance = await Balance.findOne({ user: req.user.id });
    if (!balance) {
      return res.status(404).json({ message: "Balance not found" });
    }
    return res.status(200).json({ data: balance.amount });
  } catch (error) {
    console.error("Error fetching balance:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const addBulkETF = async (req, res) => {
  try {
    const etfData = req.body;
    const etfsArray = Array.isArray(etfData) ? etfData : [etfData];
    const operations = etfsArray.map(etf => ({
      updateOne: {
        filter: { symbol: etf.symbol },
        update:  { $set: etf },
        upsert:  true
      }
    }));
    const bulkResult = await ETF.bulkWrite(operations);

    return res.status(200).json({
      message: "ETF(s) added or updated successfully",
      result: bulkResult
    });
  } catch (error) {
    console.error("Error upserting ETF(s):", error);
    res.status(500).json({
      message: "Failed to add or update ETF(s)",
      error: error.message
    });
  }
};

export { getETFs, addETFs, buyETFs, sellETFs, getMyHoldings, getBalance, addBulkETF };
