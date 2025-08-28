import express from "express";
import bodyParser from "body-parser";
import { v4 as uuidv4 } from "uuid";
import { getChannel } from "../config/rabbitmq.js";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(bodyParser.json());

// Serve client html
app.use(express.static(path.join(__dirname, "../../public")));

app.get("/health", (_, res) => res.json({ ok: true }));

// POST /chat { prompt, role }
app.post("/chat", (req, res) => {
  const { prompt, role = "user" } = req.body || {};
  if (!prompt) return res.status(400).json({ error: "prompt is required" });

  const requestId = uuidv4();
  const payload = { requestId, prompt, role };

  const ch = getChannel();
  ch.publish("chat.request", "", Buffer.from(JSON.stringify(payload)));

  console.log("📤 [HTTP] Published chat:", payload);
  res.json({ status: "queued", requestId });
});

export function startHttp(port = process.env.HTTP_PORT || 5000) {
  return new Promise((resolve) => {
    app.listen(port, () => {
      console.log(`🚀 HTTP API running at http://localhost:${port}`);
      console.log(`🧪 Open http://localhost:${port}/client.html to test`);
      resolve();
    });
  });
}
