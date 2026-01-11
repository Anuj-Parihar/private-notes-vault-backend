import supabase from "../config/supabase.js";

const authenticateUser = async (req, res, next) => {
  // If Supabase isn't configured, allow a dev user for local testing
  if (!supabase) {
    req.user = { id: "dev-user", email: "dev@example.com" };
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader)
    return res.status(401).json({ message: "Missing authorization token" });

  const token = authHeader.replace("Bearer ", "");

  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user)
      return res.status(401).json({ message: "Invalid or expired token" });

    req.user = data.user;
    return next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(500).json({ message: "Authentication error" });
  }
};

export default authenticateUser;
