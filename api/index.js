import serverless from "serverless-http";
import app from "../app.js";

// Wrap the existing Express `app` with serverless-http so Vercel can invoke it
const handler = serverless(app);

// Export a default function compatible with Vercel's Node runtime (ESM)
export default async function (req, res) {
  return handler(req, res);
}
