import { achievements } from "../../data/achievements.data.js";

const getAchievements = async (req, res) => {
    try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        res.status(200).json({ data: achievements });
    } catch (error) {
        console.error("Error fetching achievements:", error);
        res.status(500).json({ message: "Internal server error" });
    }
    };

export { getAchievements };