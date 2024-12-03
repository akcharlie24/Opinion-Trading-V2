import express from "express";
import { createUser } from "../controller/createUserController";

const router = express.Router();

router.post("/create/:userId", createUser);

export default router;
