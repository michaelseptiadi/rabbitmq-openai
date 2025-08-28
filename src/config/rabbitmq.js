import amqp from "amqplib";
import dotenv from "dotenv";
dotenv.config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";

let connection;
let channel;

export async function connectRabbit(retries = 5, delay = 5000) {
  if (channel) return channel;

  while (retries) {
    try {
      connection = await amqp.connect(RABBITMQ_URL);

      connection.on("error", (err) => {
        console.error("❌ RabbitMQ connection error:", err);
        channel = null;
      });

      connection.on("close", () => {
        console.warn("⚠️ RabbitMQ connection closed. Reconnecting...");
        channel = null;
        setTimeout(() => connectRabbit(), delay);
      });

      channel = await connection.createChannel();

      await channel.assertExchange("chat.request", "fanout", { durable: true });
      await channel.assertExchange("chat.stream", "fanout", { durable: true });

      console.log("✅ Connected to RabbitMQ");
      return channel;
    } catch (err) {
      console.error(
        `⏳ RabbitMQ not ready, retrying in ${delay / 1000}s... (${retries} retries left)`
      );
      retries -= 1;
      await new Promise((res) => setTimeout(res, delay));
    }
  }

  throw new Error("❌ Could not connect to RabbitMQ after retries");
}

export function getChannel() {
  if (!channel) throw new Error("RabbitMQ not connected");
  return channel;
}
