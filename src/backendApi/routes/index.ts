import express from "express";
import userRoutes from "./createUserRoute";
import symbolRoutes from "./createSymbolRoute";
import orderbookRoutes from "./orderbookRoute";
import balanceRoutes from "./balanceRoutes";
import onRampRoute from "./onRampRoute";
import mintRoute from "./mintRoute";
import orderRoutes from "./orderRoutes";

const router = express.Router();

// TODO: add a reset route
router.use("/user", userRoutes);
router.use("/symbol", symbolRoutes);
router.use("/orderbook", orderbookRoutes);
router.use("/balances", balanceRoutes);
router.use("/onramp", onRampRoute);
router.use("/trade", mintRoute);
router.use("/order", orderRoutes);

export default router;
