import { Router } from "express";
import {
  getUserProgress,
  logIn,
  signUp,
  logout,
} from "../controller/user.controller.js";
import { auth } from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.get("/progress", auth, getUserProgress);
userRouter.post("/signup", signUp);
userRouter.post("/login", logIn);
userRouter.post("/logout", auth, logout);

export { userRouter };