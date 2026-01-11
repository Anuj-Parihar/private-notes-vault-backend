import express from "express";
import { supabaseStatus } from "../controllers/debug.controller.js";

const router = express.Router();

// Only expose debug routes when explicitly enabled via env var
if (process.env.ENABLE_DEBUG_ROUTES === "true") {
  router.get("/supabase-status", supabaseStatus);
}

export default router;
