import express, { Request, Response } from "express";
import routes from "./routes";

const app = express();
const PORT = process.env.HTTP_PORT || 3000;

app.use(express.json());

// FIX: refactor the code to match the response schema

app.use("/api/v1", routes);

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({ message: "healthy" });
});

app.listen(PORT, () => console.log(`Started listening on ${PORT}`));
