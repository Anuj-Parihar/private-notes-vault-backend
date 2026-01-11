import express from "express";
import authenticateUser from "../middleware/auth.middleware.js";
import {
  createNote,
  getNotes,
  getSingleNote,
  deleteNote,
} from "../controllers/notes.controller.js";
import { ensureInitialized } from "../controllers/init.controller.js";

const router = express.Router();

router.use(authenticateUser);

router.post("/", createNote);
router.get("/", getNotes);
router.get("/init", ensureInitialized);
router.get("/:id", getSingleNote);
router.delete("/:id", deleteNote);

export default router;
