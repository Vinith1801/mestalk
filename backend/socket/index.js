const Message = require("../models/MessageModel");
const User = require("../models/UserModel");

const onlineUsers = new Map();

const socketSetup = (io) => {
  io.on("connection", (socket) => {
    console.log("📡 Connected:", socket.id);

    // Register user
    socket.on("register-user", async (userId) => {
      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
        await User.findByIdAndUpdate(userId, { status: "online" });
        io.emit("user-online", userId);
        console.log(`🟢 ${userId} is now online`);
      }

      onlineUsers.get(userId).add(socket.id);
      console.log(`🔗 ${userId} associated with socket ${socket.id}`);
      io.emit("online-users", Array.from(onlineUsers.keys()));
    });

    // Send message
    socket.on("send-message", async ({ senderId, receiverId, content }) => {
      if (!senderId || !receiverId || !content) return;

      const newMsg = await Message.create({
        sender: senderId,
        receiver: receiverId,
        content,
      });

      const messagePayload = {
        _id: newMsg._id,
        sender: senderId,
        receiver: receiverId,
        content,
        createdAt: newMsg.createdAt,
      };

      // Send to receiver (to all their sockets)
      const receiverSockets = onlineUsers.get(receiverId);
      if (receiverSockets) {
        for (const sockId of receiverSockets) {
          io.to(sockId).emit("receive-message", messagePayload);
        }
      }

      // Echo back to sender too
      const senderSockets = onlineUsers.get(senderId);
      if (senderSockets) {
        for (const sockId of senderSockets) {
          io.to(sockId).emit("receive-message", messagePayload);
        }
      }
    });

    // Handle disconnect
    socket.on("disconnect", async () => {
      for (const [userId, socketSet] of onlineUsers.entries()) {
        if (socketSet.has(socket.id)) {
          socketSet.delete(socket.id);
          console.log(`❌ Socket ${socket.id} removed for ${userId}`);

          if (socketSet.size === 0) {
            onlineUsers.delete(userId);
            const lastSeen = new Date();
            await User.findByIdAndUpdate(userId, {
              status: "offline",
              lastSeen,
            });
            io.emit("user-offline", { userId, lastSeen });
            console.log(`⚪ ${userId} marked offline at ${lastSeen.toLocaleTimeString()}`);
          }
          break;
        }
      }

      // Update global list
      io.emit("online-users", Array.from(onlineUsers.keys()));
    });
  });
};

module.exports = socketSetup;
