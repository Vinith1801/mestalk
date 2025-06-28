const Message = require("../models/MessageModel");
const User = require("../models/UserModel");

const onlineUsers = new Map();

const socketSetup = (io) => {
  io.on("connection", (socket) => {
    console.log("📡 Connected:", socket.id);

    // Store user's socket.id
    socket.on("register-user", (userId) => {
      onlineUsers.set(userId, socket.id);
      console.log(`🟢 User ${userId} registered with socket ${socket.id}`);
    });

    // Handle sending messages
    socket.on("send-message", async ({ senderId, receiverId, content }) => {
      if (!senderId || !receiverId || !content) return;

      // Save to DB
      const newMsg = await Message.create({ sender: senderId, receiver: receiverId, content });

      // Emit to receiver if online
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receive-message", {
          _id: newMsg._id,
          sender: senderId,
          receiver: receiverId,
          content,
          createdAt: newMsg.createdAt,
        });
      }
    });

    // Disconnect logic
    socket.on("disconnect", () => {
      for (let [userId, sockId] of onlineUsers.entries()) {
        if (sockId === socket.id) {
          onlineUsers.delete(userId);
          console.log(`🔴 User ${userId} disconnected`);
        }
      }
    });
  });
};

module.exports = socketSetup;
