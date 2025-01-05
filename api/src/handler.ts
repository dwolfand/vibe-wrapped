import serverless from "serverless-http";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import * as Sentry from "@sentry/node";
import { ProfilingIntegration } from "@sentry/profiling-node";
import { getStats } from "./handlers/stats";
import { lookupEmail, requestNotification } from "./handlers/email";
import { healthCheck } from "./handlers/health";

// Load environment variables
dotenv.config();

// Get stage from serverless
const stage = process.env.STAGE || "dev";

// Initialize Sentry only if DSN is provided
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: stage,
    integrations: [new ProfilingIntegration()],
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
  });
}

const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:4173",
    "https://wrapped.thevibestudiolynchburg.com",
    "https://dwolfand.github.io",
  ],
  methods: ["GET", "POST"],
  credentials: true,
};

// Middleware
app.use(Sentry.Handlers.requestHandler());
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.get("/api/stats/:clientId/:studioId", getStats);
app.post("/api/lookup", lookupEmail);
app.post("/api/notify-request", requestNotification);
app.get("/api/health", healthCheck);

// Only set up Sentry error handler if DSN is provided
if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler());
}

// Create the serverless handler
export const handler = serverless(app);
