import express from "express";
import userRouter from "./createUserRoute";

const router = express.Router();

router.use("/user", userRouter);

export default router;
