import User from "../models/user.model.js";
import Portfolio from "../models/portfolio.model.js";
import TradeHistory from "../models/tradeHistory.model.js";
import ChallengeInvitation from "../models/challengeInvitation.model.js";
import Balance from "../models/balance.model.js";
import XP from "../models/xp.model.js";
import { dailyChallenges } from "../../data/challenges.data.js";

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

export const getLoginFrequency = async (req, res) => {
  try {
    const users = await User.find({}, "name email loginCount");
    const loginFrequencies = users.map(user => ({
      userId: user._id,
      name: user.name,
      email: user.email,
      loginCount: user.loginCount || 0,
    }));
    res.status(200).json({ data: loginFrequencies });
  } catch (error) {
    console.error("Error fetching login frequency:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAverageSessionDuration = async (req, res) => {
  try {
    const users = await User.find({}, "name email sessionDurations");
    const sessionDurations = users.map(user => {
      const durations = user.sessionDurations || [];
      const averageDuration = durations.length > 0
        ? (durations.reduce((sum, duration) => sum + duration, 0) / durations.length).toFixed(2)
        : 0;
      return {
        userId: user._id,
        name: user.name,
        email: user.email,
        averageSessionDuration: parseFloat(averageDuration), // In seconds
      };
    });
    res.status(200).json({ data: sessionDurations });
  } catch (error) {
    console.error("Error fetching average session duration:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getTradeFrequency = async (req, res) => {
  try {
    const tradeCounts = await TradeHistory.aggregate([
      {
        $group: {
          _id: "$user",
          tradeCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          userId: "$_id",
          name: "$user.name",
          email: "$user.email",
          tradeCount: 1,
        },
      },
    ]);

    // Include users with zero trades
    const users = await User.find({}, "name email");
    const tradeFrequencies = users.map(user => {
      const tradeData = tradeCounts.find(tc => tc.userId.toString() === user._id.toString());
      return {
        userId: user._id,
        name: user.name,
        email: user.email,
        tradeCount: tradeData ? tradeData.tradeCount : 0,
      };
    });

    res.status(200).json({ data: tradeFrequencies });
  } catch (error) {
    console.error("Error fetching trade frequency:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getChallengeCompletionRate = async (req, res) => {
  try {
    const users = await User.find({}, "_id");
    const totalUsers = users.length;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const completionRates = await Promise.all(
      dailyChallenges.map(async (challenge) => {
        let completedUsers = 0;

        if (challenge.type === "trade") {
          // Count users who have made at least `challenge.target` trades today
          const tradeCounts = await TradeHistory.aggregate([
            {
              $match: {
                date: { $gte: startOfDay, $lte: endOfDay },
              },
            },
            {
              $group: {
                _id: "$user",
                tradeCount: { $sum: 1 },
              },
            },
            {
              $match: {
                tradeCount: { $gte: challenge.target },
              },
            },
            {
              $count: "completedUsers",
            },
          ]);
          completedUsers = tradeCounts[0]?.completedUsers || 0;
        } else if (challenge.id === "challenge-friend") {
          // Count users who have sent at least one challenge invitation today
          const invitationCount = await ChallengeInvitation.countDocuments({
            createdAt: { $gte: startOfDay, $lte: endOfDay },
          });
          completedUsers = invitationCount > 0 ? 1 : 0; // Simplified for demo; adjust for per-user counting
        }

        const completionRate = totalUsers > 0 ? ((completedUsers / totalUsers) * 100).toFixed(2) : 0;

        return {
          challengeId: challenge.id,
          title: challenge.title,
          type: challenge.type,
          target: challenge.target,
          completedUsers,
          totalUsers,
          completionRate: parseFloat(completionRate),
        };
      })
    );

    res.status(200).json({ data: completionRates });
  } catch (error) {
    console.error("Error fetching challenge completion rate:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};