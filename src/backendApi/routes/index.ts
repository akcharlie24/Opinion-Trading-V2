import express from "express";
import userRoutes from "./createUserRoute";
import symbolRoutes from "./createSymbolRoute";
import orderbookRoutes from "./orderbookRoute";
import balanceRoutes from "./balanceRoutes";

const router = express.Router();

// router.use("/reset", resetroutes)
// router.use("/onramp", onrampRoutes)
// router.use("/balance", balanceRoutes)
// router.use("/trade", tradeRoutes);
// router.use("/order", orderRoutes);

// router.get("/:stockSymbol", getOrderbook);

// balanceRoutes.get("/inr/:userId", getINRBalance);
// balanceRoutes.get("/stock/:userId", getStockBalance);
// balanceRoutes.get("/stock", getallStockBalance);

router.use("/user", userRoutes);
router.use("/symbol", symbolRoutes);
router.use("/orderbook", orderbookRoutes);
router.use("/balances", balanceRoutes);

export default router;
