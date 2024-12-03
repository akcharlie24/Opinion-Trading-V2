import express from "express";
import { getOrderBook } from "../controller/orderbookController";

const router = express.Router();

router.get("/", getOrderBook);

export default router;
