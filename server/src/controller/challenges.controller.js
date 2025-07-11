import { dailyChallenges } from "../../data/challenges.data.js";
import XP from "../models/xp.model.js";
import TradeHistory from "../models/tradeHistory.model.js"; // Add this import

const getDailyChallenges = async (req, res) => {
  try {
    // Simulate delay as per original functionality
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Get user ID from request (assuming auth middleware adds req.user)
    const userId = req.user ? req.user.id : null;

    let challengesWithProgress = dailyChallenges;

    if (userId) {
      // Define today's date range
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      // Count user's trades today
      const tradeCount = await TradeHistory.countDocuments({
        user: userId,
        date: { $gte: startOfDay, $lte: endOfDay }
      });

      // Update challenges with dynamic progress and completion
      challengesWithProgress = dailyChallenges.map(challenge => ({
        ...challenge,
        progress: Math.min(tradeCount, challenge.target),
        completed: tradeCount >= challenge.target
      }));
    }

    res.status(200).json({ data: challengesWithProgress });
  } catch (error) {
    console.error("Error fetching daily challenges:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getMyXP = async (req, res) => {
  const userId = req.user.id;
  try {
    const xp = await XP.findOne({ user: userId });
    if (!xp) {
      return res.status(404).json({ message: "XP not found" });
    }
    res.status(200).json({ data: xp });
  } catch (error) {
    console.error("Error fetching XP:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { getDailyChallenges, getMyXP };