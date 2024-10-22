import express from "express";
import { onRampMoney } from "../controller/onRampController";

const router = express.Router();

router.post("/inr", onRampMoney);

export default router;
