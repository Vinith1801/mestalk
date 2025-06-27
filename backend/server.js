require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const connectDB = require("./config/db");

// Route imports
const authRoutes = require("./routes/authRoutes");
const messageRoutes = require("./routes/messageRoutes");

// Initialize app and connect DB
const app = express();
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// REST API routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Base route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// --- Create HTTP server BEFORE socket.io setup
const server = http.createServer(app);

// --- Initialize Socket.IO AFTER server is created
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// --- Now it's safe to use socketSetup(io)
const socketSetup = require("./socket");
socketSetup(io);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
