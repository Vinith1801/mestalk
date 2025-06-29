const Message = require("../models/MessageModel");
const User = require("../models/UserModel");

const onlineUsers = new Map();

const socketSetup = (io) => {
  io.on("connection", (socket) => {
    console.log("📡 Connected:", socket.id);

    // Store user's socket.id
    socket.on("register-user", (userId) => {
      onlineUsers.set(userId, socket.id);
      console.log(`🟢 Registered user ${userId} with socket ${socket.id}`);
      console.log("Online Users Map:", Array.from(onlineUsers.entries()));
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
        console.log(`💬 Message from ${senderId} to ${receiverId}: ${content}`);
        console.log("Receiver Socket:", onlineUsers.get(receiverId));
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
