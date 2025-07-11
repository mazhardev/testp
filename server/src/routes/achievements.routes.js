import { Router } from "express";
import { getAchievements } from "../controller/achievements.controller.js";

const achievementsRouter = Router();

achievementsRouter.get("/", getAchievements);

export { achievementsRouter };