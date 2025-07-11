import express from "express";
import cors from "cors";
import { portfolioRouter } from "./routes/portfolio.routes.js";
import { userRouter } from "./routes/user.routes.js";
import { challengesRouter } from "./routes/challenges.routes.js";
import { achievementsRouter } from "./routes/achievements.routes.js";
import { friendsRouter } from "./routes/friends.routes.js";
import { competitionsRouter } from "./routes/competitions.routes.js";
import { adminRouter } from "./routes/admin.routes.js";
import dotenv from "dotenv";
import { updateLastActive } from "./middlewares/updateLastActive.js";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
// app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "../../client/dist")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../client/dist/index.html"));
});

app.use("/api/v1/portfolio", updateLastActive, portfolioRouter);
app.use("/api/v1/user", updateLastActive, userRouter);
app.use("/api/v1/challenges", updateLastActive, challengesRouter);
app.use("/api/v1/achievements", updateLastActive, achievementsRouter);
app.use("/api/v1/friends", updateLastActive, friendsRouter);
app.use("/api/v1/competitions", updateLastActive, competitionsRouter);
app.use("/api/v1/admin", updateLastActive, adminRouter);

export { app };