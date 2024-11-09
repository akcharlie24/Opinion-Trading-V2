import express, { Request, Response } from "express";
import routes from "./routes";

const app = express();
const port = 3000;

app.use(express.json());

// FIX: refactor the code to match the response schema

app.use("/api/v1", routes);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "hello there" });
});

app.listen(port, () => console.log(`Started listening on ${port}`));
