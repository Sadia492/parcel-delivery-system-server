import express, { Request, Response } from "express";
import routes from "./routes";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.use("/api", routes);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to parcel management system",
  });
});

export default app;
