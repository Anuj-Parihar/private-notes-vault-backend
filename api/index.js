import app from "../app.js";

// Export a simple handler that delegates to the Express `app`.
// Express apps are callable (req, res) and work as Vercel function handlers.
export default async function handler(req, res) {
  return app(req, res);
}
