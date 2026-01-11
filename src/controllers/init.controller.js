import * as NotesModel from "./notes.controller.js";
import * as NotesModelLow from "../models/notes.model.js";

// Endpoint to explicitly ensure the user's account has an initial welcome note.
export const ensureInitialized = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { data, error } = await NotesModelLow.getAllNotes(userId);
    if (error) {
      console.error("getAllNotes error during init:", error);
      return res.status(500).json({ message: "Failed to check notes" });
    }

    if (Array.isArray(data) && data.length > 0)
      return res.json({ initialized: true });

    // Do not auto-create a welcome note. Return initialized = false so client can handle empty state.
    return res.json({ initialized: false });
  } catch (err) {
    console.error("init.controller exception:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
