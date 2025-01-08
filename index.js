const express = require("express");
const cors = require("cors");
const { WebSocketServer } = require("ws");

const app = express();

// Middleware xử lý CORS
app.use(
  cors({
    origin: "*", // Điều chỉnh cụ thể origin nếu cần
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware xử lý JSON và URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// WebSocket Server
const server = require("http").createServer(app);
const wss = new WebSocketServer({ server });

let status = "noData";
let content = null;

wss.on("connection", (ws) => {
  console.log("WebSocket client connected");
  ws.send(JSON.stringify({ status, content }));

  ws.on("close", () => {
    console.log("WebSocket client disconnected");
  });
});

const broadcastData = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

// Endpoint GET /data
app.get("/data", (req, res) => {
  res.status(200).json({ status, content });
});

// Endpoint POST /data
app.post("/data", (req, res) => {
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);

  const { Status, Content } = req.body;

  if (!Status && !Content) {
    return res.status(400).json({
      message:
        "Thiếu giá trị `newStatus` hoặc `newContent` trong body request.",
    });
  }

  if (Status) {
    status = Status;
  }

  if (Content) {
    content = Content;
  }

  broadcastData({ status, content });

  res.status(200).json({
    message: "Dữ liệu đã được cập nhật.",
    status,
    content,
  });
});

// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
