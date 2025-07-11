import User from "../models/user.model.js";

export const updateLastActive = async (req, res, next) => {
try {
    if (req.user && req.user.id) {
    await User.findByIdAndUpdate(req.user.id, { lastActive: new Date() });
    }
    next();
} catch (error) {
    console.error("Error updating lastActive:", error);
    next();
 }
};