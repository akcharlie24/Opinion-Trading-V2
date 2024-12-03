import express from "express";
import { createSellOrder } from "../controller/sellController";
import { createBuyOrder } from "../controller/buyController";

const router = express.Router();

router.post("/sell", createSellOrder);
router.post("/buy", createBuyOrder);

export default router;
