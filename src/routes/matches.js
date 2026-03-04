import { Router } from "express";
import {
  createMatchSchema,
  listMatchesQuerySchema,
} from "../validation/matches.js";
import { db } from "../db/db.js";
import { matches } from "../db/schema.js";
import { getMatchStatus } from "../utils/match-status.js";

export const matchesRouter = Router();

matchesRouter.get("/", async (req, res) => {
  const parsed = listMatchesQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues });
  }
  const limit = Math.min(parsed.data.limit ?? 20, 50);
  try {
    const data = await db
      .select()
      .from(matches)
      .orderBy(matches.startTime)
      .limit(limit);
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch matches" });
  }
});

matchesRouter.post("/", async (req, res) => {
  const parsed = createMatchSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues });
  }
  const { startTime, endTime, homeScore, awayScore } = parsed.data;
  try {
    const [event] = await db
      .insert(matches)
      .values({
        ...parsed.data,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        homeScore: homeScore ?? 0,
        awayScore: awayScore ?? 0,
        status: getMatchStatus(startTime, endTime),
      })
      .returning();
    res.status(201).json({ data: event });
  } catch (error) {
    res.status(500).json({ error: "Failed to create match" });
  }
});
