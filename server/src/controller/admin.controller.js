import User from "../models/user.model.js";
import Portfolio from "../models/portfolio.model.js";
import TradeHistory from "../models/tradeHistory.model.js";
import ChallengeInvitation from "../models/challengeInvitation.model.js";
import Balance from "../models/balance.model.js";
import XP from "../models/xp.model.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password"); // Exclude passwords
    res.status(200).json({ data: users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllPortfolios = async (req, res) => {
  try {
    const portfolios = await Portfolio.find().populate("user", "name email").populate("stocks.etf", "symbol name");
    res.status(200).json({ data: portfolios });
  } catch (error) {
    console.error("Error fetching portfolios:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllTradeHistories = async (req, res) => {
  try {
    const tradeHistories = await TradeHistory.find().populate("user", "name email");
    res.status(200).json({ data: tradeHistories });
  } catch (error) {
    console.error("Error fetching trade histories:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllChallengeInvitations = async (req, res) => {
  try {
    const challengeInvitations = await ChallengeInvitation.find()
      .populate("sender", "name email")
      .populate("recipient", "name email");
    res.status(200).json({ data: challengeInvitations });
  } catch (error) {
    console.error("Error fetching challenge invitations:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllBalances = async (req, res) => {
  try {
    const balances = await Balance.find().populate("user", "name email");
    res.status(200).json({ data: balances });
  } catch (error) {
    console.error("Error fetching balances:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllXPs = async (req, res) => {
  try {
    const xps = await XP.find().populate("user", "name email");
    res.status(200).json({ data: xps });
  } catch (error) {
    console.error("Error fetching XPs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};