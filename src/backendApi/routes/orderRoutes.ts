import express from "express";
import { createSellOrder } from "../controller/sellController";

const router = express.Router();

router.post("/sell", createSellOrder);

export default router;
