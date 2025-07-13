import { Router } from "express";
import { auth } from "../middlewares/auth.middleware.js";
import { admin } from "../middlewares/admin.middleware.js";
import {
    getAllUsers,
    getAllPortfolios,
    getAllTradeHistories,
    getAllChallengeInvitations,
    getAllBalances,
    getAllXPs,
    getLoginFrequency,
    getAverageSessionDuration,
    getTradeFrequency,
    getChallengeCompletionRate,
} from "../controller/admin.controller.js";

const adminRouter = Router();

adminRouter.get("/users", auth, admin, getAllUsers);
adminRouter.get("/portfolios", auth, admin, getAllPortfolios);
adminRouter.get("/tradehistories", auth, admin, getAllTradeHistories);
adminRouter.get("/challengeinvitations", auth, admin, getAllChallengeInvitations);
adminRouter.get("/balances", auth, admin, getAllBalances);
adminRouter.get("/xps", auth, admin, getAllXPs);
adminRouter.get("/login-frequency", auth, admin, getLoginFrequency);
adminRouter.get("/session-duration", auth, admin, getAverageSessionDuration);
adminRouter.get("/trade-frequency", auth, admin, getTradeFrequency);
adminRouter.get("/challenge-completion-rate", auth, admin, getChallengeCompletionRate);

export { adminRouter };