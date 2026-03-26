import express from "express";
import cors from "cors";
import routes from "./routes";

export const createApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app.use("/api", routes);
  return app;
};