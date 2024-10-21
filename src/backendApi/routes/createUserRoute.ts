import express from "express";
import { createUserController } from "../controller/createUserController";

const router = express.Router();

router.post("/create/:userId", createUserController);

export default router;
