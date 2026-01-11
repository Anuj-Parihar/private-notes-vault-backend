import express from "express";
import authenticateUser from "../middleware/auth.middleware.js";
import { ensureProfile, createUser } from "../controllers/auth.controller.js";

console.log("[server] auth.routes loaded");
const router = express.Router();
console.log("[server] auth.routes paths will be:", []);

// Ensure an authenticated user's profile exists
router.post("/ensure", authenticateUser, ensureProfile);

// Optionally allow server-side signup to create confirmed users (requires service role)
router.post("/signup", createUser);

console.log(
  "[server] auth.routes registered:",
  router.stack.filter((s) => s.route).map((s) => s.route.path)
);

export default router;
