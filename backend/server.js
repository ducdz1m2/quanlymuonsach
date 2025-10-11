const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const config = require("./app/config");
const MongoDB = require("./app/utils/mongodb.util");
const MessageService = require("./app/services/message.service");

async function startServer() {
  try {
    await MongoDB.connect(config.db.uri);
    console.log("✅ Connected to the database!");

    const PORT = config.app.port || 3000;
    const server = http.createServer(app);

    // ⚙️ Socket.IO setup với CORS đầy đủ
    const io = new Server(server, {
      cors: {
        origin: [
          "http://localhost:3000",
          "http://localhost:3001",
          "http://localhost:3002",
          "http://localhost:5000",
          "http://localhost:5001",
          "http://localhost:5002",
        ],
        methods: ["GET", "POST"],
        credentials: true, // Quan trọng nếu bạn dùng cookie / session
      },
      transports: ["websocket", "polling"], // hỗ trợ cả polling fallback
    });

    io.on("connection", (socket) => {
      console.log("🟢 Client connected:", socket.id);

      // Khi client gửi message
      socket.on("sendMessage", async (data) => {
        try {
          const messageService = new MessageService(MongoDB.client);
          const message = await messageService.create(data);

          // Gửi lại cho tất cả client cùng room
          io.emit("receiveMessage", message);
        } catch (error) {
          console.error("❌ Lỗi lưu tin nhắn:", error);
        }
      });

      // Optional: join room logic nếu bạn dùng roomId
      socket.on("joinRoom", (roomId) => {
        socket.join(roomId);
        console.log(`📘 Client ${socket.id} joined room ${roomId}`);
      });

      socket.on("leaveRoom", (roomId) => {
        socket.leave(roomId);
        console.log(`📕 Client ${socket.id} left room ${roomId}`);
      });

      socket.on("disconnect", () => {
        console.log("🔴 Client disconnected:", socket.id);
      });
    });

    server.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.log("❌ Cannot connect to the database!", error);
    process.exit();
  }
}

startServer();
