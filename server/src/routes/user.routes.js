import { Router } from "express";
import {
  getUserProgress,
  logIn,
  signUp,
} from "../controller/user.controller.js";
import { auth } from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.get("/progress", auth, getUserProgress);
userRouter.post("/signup", signUp);
userRouter.post("/login", logIn);

export { userRouter };
