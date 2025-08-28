import dotenv from "dotenv";
dotenv.config();

import { connectRabbit } from "./config/rabbitmq.js";
import { startHttp } from "./http/http-api.js";
import { startWs } from "./ws/ws-server.js";
import { startWorker } from "./worker/openai-worker.js";

(async () => {
  await connectRabbit();
  await startHttp();
  await startWs();
  await startWorker();
})();
