import { Router } from "express";
import {
  addETFs,
  buyETFs,
  getETFs,
  getMyHoldings,
  sellETFs,
  getBalance,
  addBulkETF
} from "../controller/portfolio.controller.js";
import { auth } from "../middlewares/auth.middleware.js";

const portfolioRouter = Router();

portfolioRouter.get("/etfs", getETFs);
portfolioRouter.post("/etfs", addETFs);
portfolioRouter.post("/buyetf", auth, buyETFs);
portfolioRouter.post("/selletfs", auth, sellETFs);
portfolioRouter.get("/myholdings", auth, getMyHoldings);
portfolioRouter.get("/balance", auth, getBalance);
portfolioRouter.post("/bulk-etfs", addBulkETF);

export { portfolioRouter };
