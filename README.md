# RabbitMQ + OpenAI Streaming Example

This project demonstrates a full flow using **HTTP → Worker (RabbitMQ) → WebSocket → Frontend**.  
The workflow is:

1. Client sends an HTTP request (`/publish`) with a `prompt` and `role`.
2. The request is published to **RabbitMQ** (`chat.request` exchange).
3. A **worker** subscribes to `chat.request`, calls the **OpenAI API**, and streams the response back via RabbitMQ (`chat.stream` exchange).
4. A **WebSocket server** forwards the `chat.stream` messages to connected frontend clients in real time.

---

## 🚀 Features
- **Express HTTP API** for publishing messages
- **RabbitMQ** as the pub/sub broker
- **OpenAI API integration** (streaming responses)
- **WebSocket server** to push responses to the browser
- Dockerized setup with RabbitMQ management UI

---

## 📦 Installation

### 1. Clone the repository
```bash
git clone https://github.com/michaelseptiadi/rabbitmq-openai.git
cd rabbitmq-openai
docker-compose up --build
```

### 2. Open the project
Once the containers are running, open in your browser: http://localhost:5000/client.html