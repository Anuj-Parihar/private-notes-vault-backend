import * as NotesModel from "../models/notes.model.js";

export const createNote = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content)
      return res.status(400).json({ message: "Title and content required" });

    const { data, error } = await NotesModel.createNote(
      req.user.id,
      title,
      content
    );

    if (error) {
      console.error("createNote error:", error);
      return res.status(500).json({ message: "Failed to create note" });
    }

    res.status(201).json(data);
  } catch (err) {
    console.error("createNote exception:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getNotes = async (req, res) => {
  try {
    const { data, error } = await NotesModel.getAllNotes(req.user.id);

    if (error) {
      console.error("getNotes error:", error);
      return res.status(500).json({ message: "Failed to fetch notes" });
    }

    // Return empty list when no notes exist; do not auto-create a welcome note.
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return res.json([]);
    }

    res.json(data);
  } catch (err) {
    console.error("getNotes exception:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getSingleNote = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await NotesModel.getNoteById(req.user.id, id);

    if (error || !data)
      return res.status(404).json({ message: "Note not found" });

    res.json(data);
  } catch (err) {
    console.error("getSingleNote exception:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await NotesModel.deleteNote(req.user.id, id);

    if (error) {
      console.error("deleteNote error:", error);
      if (error.message === "Not found")
        return res.status(404).json({ message: "Note not found" });
      return res.status(500).json({ message: "Failed to delete note" });
    }

    res.status(204).send();
  } catch (err) {
    console.error("deleteNote exception:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
