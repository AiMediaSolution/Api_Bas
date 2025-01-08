const express = require("express");
const cors = require("cors");
const { WebSocketServer } = require("ws");

const app = express();
app.use(cors());
app.use(express.json());

let status = "noData";
let content = null;

// Tạo server HTTP để sử dụng WebSocket
const server = require("http").createServer(app);

// Tạo WebSocket server
const wss = new WebSocketServer({ server });

// Khi một client kết nối
wss.on("connection", (ws) => {
  console.log("WebSocket client connected");

  // Gửi trạng thái ban đầu cho client
  ws.send(JSON.stringify({ status, content }));

  ws.on("close", () => {
    console.log("WebSocket client disconnected");
  });
});

// Gửi dữ liệu cho tất cả client WebSocket
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
  const { Status, Content } = req.body;

  if (!Status && !Content) {
    return res.status(400).json({
      message: "Thiếu giá trị `Status` hoặc `Content` trong body request.",
    });
  }

  if (Status) {
    status = Status; // Cập nhật trạng thái
  }

  if (Content) {
    content = Content; // Cập nhật nội dung
  }

  let message;
  switch (status) {
    case "fail":
      message = "Quá trình thất bại. Vui lòng kiểm tra lại.";
      break;
    case "success":
      message = "Thành công! Dữ liệu đã được xử lý.";
      break;
    case "doing":
      message = "Hệ thống đang xử lý yêu cầu. Vui lòng đợi.";
      break;
    default:
      message = "Trạng thái không xác định.";
  }

  // Phát dữ liệu mới cho tất cả client WebSocket
  broadcastData({ status, content, message });

  // Trả về phản hồi
  res.status(200).json({
    message,
    status,
    content,
  });
});

// Start server
const PORT = 3000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
