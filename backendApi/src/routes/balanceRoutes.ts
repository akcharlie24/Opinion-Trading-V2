import express from "express";
import {
  getAllINRBalances,
  getAllStockBalances,
  getINRBalance,
  getStockBalance,
} from "../controller/getBalancesController";

const router = express.Router();

router.get("/inr", getAllINRBalances);
router.get("/inr/:userId", getINRBalance);
router.get("/stock", getAllStockBalances);
router.get("/stock/:userId", getStockBalance);

export default router;
