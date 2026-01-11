import express from "express";
import cors from "cors";
import notesRoutes from "./src/routes/notes.routes.js";
import debugRoutes from "./src/routes/debug.routes.js";
import authRoutes from "./src/routes/auth.routes.js";

const app = express();

app.use((req, res, next) => {
  console.log("[server] incoming", req.method, req.path);
  next();
});
app.use(cors());
// Fallback CORS headers for environments where the automatic CORS handler
// doesn't reflect the request origin correctly (keeps behavior unchanged)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header(
      "Access-Control-Allow-Methods",
      "GET,HEAD,POST,PUT,DELETE,OPTIONS"
    );
    return res.status(200).send();
  }
  next();
});

app.use(express.json());

app.use("/api/notes", notesRoutes);
app.use("/api/debug", debugRoutes);
app.use("/api/auth", authRoutes);

// Temporary diagnostic route
app.post("/api/auth/_test", (_, res) => res.json({ ok: true }));

app.get("/", (_, res) => {
  res.send("Private Notes Vault API");
});

export default app;
