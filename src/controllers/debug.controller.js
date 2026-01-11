import supabase, { isServiceRole } from "../config/supabase.js";

export const supabaseStatus = async (req, res) => {
  const status = {
    configured: !!supabase,
    serviceRole: !!isServiceRole,
    canQueryNotes: false,
    error: null,
  };

  if (!supabase) return res.json(status);

  try {
    // Attempt a lightweight query to check table existence & permissions
    const { data, error } = await supabase.from("notes").select("id").limit(1);
    if (error) {
      status.error = error.message || String(error);
      return res.json(status);
    }
    status.canQueryNotes = true;
    return res.json(status);
  } catch (err) {
    status.error = err.message || String(err);
    return res.json(status);
  }
};
