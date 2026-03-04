import { Router } from "express";

export const matchesRouter = Router();

matchesRouter.get("/", (req, res) => {
  res.send("Matches route");
});
