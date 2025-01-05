import { Request, Response } from "express";
import * as Sentry from "@sentry/node";
import { getDb } from "../utils/mongo";
import { logActivity } from "../utils/logger";

const stage = process.env.STAGE || "dev";

export async function getStats(req: Request, res: Response) {
  const { clientId, studioId } = req.params;
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const userAgent = req.headers["user-agent"];

  try {
    console.log(
      `Querying stats for clientId: ${clientId} and studioId: ${studioId}`
    );

    if (process.env.SENTRY_DSN) {
      Sentry.addBreadcrumb({
        category: "stats-query",
        message: "Stats queried",
        data: {
          clientId,
          studioId,
          ip,
          userAgent,
          stage,
        },
        level: "info",
      });
    }

    // Get stats from MongoDB
    const db = await getDb();
    const stats = await db.collection("vibe_workout_stats").findOne({
      clientId: clientId,
      studioId: studioId,
    });

    if (!stats) {
      // Log the failed attempt
      await logActivity({
        type: "stats_not_found",
        clientId,
        studioId,
        ip,
        userAgent,
        status: 404,
        error: "Stats not found",
      });
      return res
        .status(404)
        .json({ error: "Stats not found for this client ID and studio" });
    }

    // Log the successful request
    await logActivity({
      type: "stats_lookup",
      clientId,
      studioId,
      ip,
      userAgent,
      status: 200,
    });

    // console.log(JSON.stringify(stats, null, 2));

    res.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);

    if (process.env.SENTRY_DSN) {
      Sentry.withScope((scope) => {
        scope.setExtra("ip", ip);
        scope.setExtra("userAgent", userAgent);
        scope.setExtra("stage", stage);
        Sentry.captureException(error);
      });
    }

    // Log the error
    await logActivity({
      type: "error",
      clientId,
      studioId,
      ip,
      userAgent,
      status: 500,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    res.status(500).json({ error: "Internal server error" });
  }
}
