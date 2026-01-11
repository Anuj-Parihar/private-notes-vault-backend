import supabase, { isServiceRole } from "../config/supabase.js";

// Ensure the authenticated user has a profile row and minimal metadata.
export const ensureProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Check for existing profile
    const { data: existing, error: selectErr } = await supabase
      .from("profiles")
      .select("id, short_id, email")
      .eq("id", userId)
      .maybeSingle();

    if (selectErr) {
      console.error("profiles select error:", selectErr);
      // Fall through to attempt an insert anyway
    }

    if (existing && existing.id) {
      return res.json({ created: false, profile: existing });
    }

    // Create a short_id from the first 8 chars of the UUID (deterministic small id)
    const shortId = userId.replace(/-/g, "").slice(0, 8);

    const { data, error } = await supabase.from("profiles").insert([
      {
        id: userId,
        email: req.user?.email || null,
        short_id: shortId,
      },
    ]);

    if (error) {
      console.error("profiles insert error:", error);
      return res
        .status(500)
        .json({ message: "Failed to ensure profile", error });
    }

    return res.json({ created: true, profile: data?.[0] });
  } catch (err) {
    console.error("ensureProfile exception:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Create user using Supabase Admin API so manual signup can be simple for users
export const createUser = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    if (!supabase || !isServiceRole) {
      // Service role not available — cannot create admin user server-side
      return res
        .status(501)
        .json({ message: "Server-side user creation not available" });
    }

    // Use admin API to create user (attempt to mark email as confirmed when possible)
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      console.error("admin.createUser error:", error);
      return res.status(500).json({ message: "Failed to create user", error });
    }

    return res.json({ created: true, user: data });
  } catch (err) {
    console.error("createUser exception:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
