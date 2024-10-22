import express from "express";
import { mintStocks } from "../controller/mintingController";

const router = express.Router();

router.post("/mint", mintStocks);

export default router;
