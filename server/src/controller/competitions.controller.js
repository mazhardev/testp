import { competitions } from "../../data/competitions.data.js";
import Portfolio from "../models/portfolio.model.js";
import ETF from "../models/etf.model.js";
import User from "../models/user.model.js"; 

const getCompetitions = async (req, res) => {
    try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        res.status(200).json({ data: competitions });
    } catch (error) {
        console.error("Error fetching competitions:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const joinCompetition = async (req, res) => {
    try {
        const { competitionId } = req.body;
        const competition = competitions.find((c) => c.id === competitionId);
        if (!competition) {
            return res.status(404).json({ message: "Competition not found" });
        }
        if (competition.status !== "upcoming") {
            return res.status(400).json({ message: "Cannot join this competition" });
        }

        // Fetch user data
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Fetch user's portfolio and calculate portfolio value
        const portfolio = await Portfolio.findOne({ user: req.user.id }).populate("stocks.etf");
        let portfolioValue = 0;
        if (portfolio) {
            for (const stock of portfolio.stocks) {
                const etf = await ETF.findById(stock.etf._id);
                portfolioValue += stock.quantity * (etf?.price || 0);
            }
        }

        // Check if user is already a participant
        const isAlreadyParticipant = competition.participants.some(
            (p) => p.userId === req.user.id
        );
        if (isAlreadyParticipant) {
            return res.status(400).json({ message: "User already joined this competition" });
        }

        // Add user to competition
        competition.participants.push({
            userId: req.user.id,
            name: user.name || "Anonymous Trader", // Use user's name from User model
            portfolioValue: portfolioValue || 100000, // Default to 100,000 if no portfolio
            rank: competition.participants.length + 1,
            investmentStrategy: "moderate", // Could be dynamic based on user profile
            riskTolerance: "medium", // Could be dynamic based on user profile
        });

        res.status(200).json({ message: "Joined competition successfully", data: competition });
    } catch (error) {
        console.error("Error joining competition:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export { getCompetitions, joinCompetition };