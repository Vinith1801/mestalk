require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const connectDB = require("./config/db");
const { Server } = require("socket.io");

// Initialize app
const app = express();
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json()); // For JSON parsing

// Placeholder routes
app.get("/", (req, res) => {
  res.send("Chat API is running...");
});

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "*", // Allow frontend dev server
    methods: ["GET", "POST"],
  },
});

// WebSocket logic
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
