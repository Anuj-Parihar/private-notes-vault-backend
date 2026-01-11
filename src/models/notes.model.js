import supabase from "../config/supabase.js";
import { randomUUID } from "crypto";

// In-memory store used when Supabase is not configured (local/dev mode)
const __inMemoryNotes = [];

const inMemoryCreate = async (userId, title, content) => {
  const note = {
    id: randomUUID(),
    user_id: userId,
    title,
    content,
    created_at: new Date().toISOString(),
  };
  __inMemoryNotes.push(note);
  return { data: note, error: null };
};

const inMemoryGetAll = async (userId) => {
  const data = __inMemoryNotes
    .filter((n) => n.user_id === userId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  return { data, error: null };
};

const inMemoryGetById = async (userId, noteId) => {
  const note = __inMemoryNotes.find(
    (n) => n.user_id === userId && n.id === noteId
  );
  if (!note) return { data: null, error: new Error("Not found") };
  return { data: note, error: null };
};

const inMemoryDelete = async (userId, noteId) => {
  const idx = __inMemoryNotes.findIndex(
    (n) => n.user_id === userId && n.id === noteId
  );
  if (idx === -1) return { error: new Error("Not found") };
  __inMemoryNotes.splice(idx, 1);
  return { error: null };
};

export const createNote = async (userId, title, content) => {
  if (!supabase) return inMemoryCreate(userId, title, content);
  return await supabase
    .from("notes")
    .insert([{ user_id: userId, title, content }])
    .select()
    .single();
};

export const getAllNotes = async (userId) => {
  if (!supabase) return inMemoryGetAll(userId);
  return await supabase
    .from("notes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
};

export const getNoteById = async (userId, noteId) => {
  if (!supabase) return inMemoryGetById(userId, noteId);
  return await supabase
    .from("notes")
    .select("*")
    .eq("id", noteId)
    .eq("user_id", userId)
    .single();
};

export const deleteNote = async (userId, noteId) => {
  if (!supabase) return inMemoryDelete(userId, noteId);
  return await supabase
    .from("notes")
    .delete()
    .eq("id", noteId)
    .eq("user_id", userId);
};
