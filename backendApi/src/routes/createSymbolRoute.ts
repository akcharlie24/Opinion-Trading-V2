import express from "express";
import { createSymbol } from "../controller/createSymbolController";

const router = express.Router();

router.post("/create/:stockSymbol", createSymbol);

export default router;
