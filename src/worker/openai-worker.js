import { getChannel } from "../config/rabbitmq.js";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function startWorker() {
  const ch = getChannel();

  // Queue untuk worker → bind dari chat.request
  const q = await ch.assertQueue("chat_worker_openai", { durable: true });
  await ch.bindQueue(q.queue, "chat.request", "");

  console.log("🛠 Worker waiting on chat_worker_openai...");

  ch.consume(
    q.queue,
    async (msg) => {
      const { requestId, prompt, role } = JSON.parse(msg.content.toString());
      console.log("🛠 Processing:", { requestId, prompt });

      try {
        // Streaming dari OpenAI
        const stream = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role, content: prompt }],
          stream: true
        });

        for await (const part of stream) {
          const token = part.choices?.[0]?.delta?.content;
          if (token) {
            ch.publish(
              "chat.stream",
              "",
              Buffer.from(JSON.stringify({ requestId, delta: token }))
            );
          }
        }

        // penanda selesai
        ch.publish(
          "chat.stream",
          "",
          Buffer.from(JSON.stringify({ requestId, done: true }))
        );
      } catch (err) {
        console.error("❌ OpenAI stream error:", err.message);
        ch.publish(
          "chat.stream",
          "",
          Buffer.from(JSON.stringify({ requestId, error: err.message }))
        );
      } finally {
        ch.ack(msg);
      }
    },
    { noAck: false }
  );
}
