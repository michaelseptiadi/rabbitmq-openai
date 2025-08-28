import { WebSocketServer } from "ws";
import { getChannel } from "../config/rabbitmq.js";
import dotenv from "dotenv";
dotenv.config();

export async function startWs(port = process.env.WS_PORT || 4001) {
  const wss = new WebSocketServer({ port });
  const ch = getChannel();

  // Ephemeral queue untuk WS broadcaster → bind dari chat.stream
  const q = await ch.assertQueue("", { exclusive: true });
  await ch.bindQueue(q.queue, "chat.stream", "");

  // Forward semua stream ke semua client
  ch.consume(
    q.queue,
    (msg) => {
      const payload = msg.content.toString();
      wss.clients.forEach((client) => {
        if (client.readyState === 1) client.send(payload);
      });
    },
    { noAck: true }
  );

  wss.on("connection", () => {
    console.log("🔌 WS client connected");
  });

  console.log(`📡 WS running at ws://localhost:${port}`);
}
