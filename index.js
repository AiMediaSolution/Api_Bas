const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());
let status = "noData";
let content = null;

app.get("/data", (req, res) => {
  res.status(200).json({ status, content });
});

app.post("/data", (req, res) => {
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

  res.status(200).json({
    message: "Dữ liệu đã được cập nhật.",
    status,
    content,
  });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
