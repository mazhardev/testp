import { Router } from "express";
import {
  getDailyChallenges,
  getMyXP,
} from "../controller/challenges.controller.js";
import { auth } from "../middlewares/auth.middleware.js";

const challengesRouter = Router();

challengesRouter.get("/daily", auth, getDailyChallenges);
challengesRouter.get("/myxp", auth, getMyXP);

export { challengesRouter };
