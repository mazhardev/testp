import { Router } from "express";
import { getCompetitions, joinCompetition } from "../controller/competitions.controller.js";
import { auth } from "../middlewares/auth.middleware.js";

const competitionsRouter = Router();

competitionsRouter.get("/", getCompetitions);
competitionsRouter.post("/join",auth, joinCompetition);

export { competitionsRouter };