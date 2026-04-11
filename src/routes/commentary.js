import { Router } from "express";
import { db } from "../db/db.js";
import { commentary } from "../db/schema.js";
import { eq, desc } from "drizzle-orm";
import { matchIdParamSchema } from "../validation/matches.js";
import {
  listCommentaryQuerySchema,
  createCommentarySchema,
} from "../validation/commentary.js";
import { ZodError } from "zod";

export const commentaryRouter = Router({ mergeParams: true });

commentaryRouter.get("/", async (req, res) => {
  try {
    const { id: matchId } = matchIdParamSchema.parse(req.params);
    const { limit: queryLimit } = listCommentaryQuerySchema.parse(req.query);
    const limit = Math.min(queryLimit ?? 100, 100);

    const commentaryList = await db
      .select()
      .from(commentary)
      .where(eq(commentary.matchId, matchId))
      .orderBy(desc(commentary.createdAt))
      .limit(limit);

    return res.status(200).json({ data: commentaryList });
  } catch (error) {
    if (error instanceof ZodError) {
      console.error("Validation error:", error);
      return res.status(400).json({ error: error.errors });
    }

    console.error("Error listing commentary:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

commentaryRouter.post("/", async (req, res) => {
  try {
    const { id: matchId } = matchIdParamSchema.parse(req.params);
    const payload = createCommentarySchema.parse(req.body);

    const [newCommentary] = await db
      .insert(commentary)
      .values({ matchId, ...payload })
      .returning();

    if (res.app.locals.broadcastCommentary) {
      res.app.locals.broadcastCommentary(newCommentary.matchId, newCommentary);
    }

    return res.status(201).json({ data: newCommentary });
  } catch (error) {
    if (error instanceof ZodError) {
      console.error("Validation error:", error);
      return res.status(400).json({ error: error.errors });
    }

    console.error("Error creating commentary:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});
