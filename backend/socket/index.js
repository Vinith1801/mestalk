const ChatRoom = require("../models/ChatRoomModel");
const Message = require("../models/MessageModel");

const socketSetup = (io) => {
  io.on("connection", (socket) => {
    console.log("🔌 New client connected:", socket.id);

    // Join a specific chat room
    socket.on("join-room", ({ roomId }) => {
      socket.join(roomId);
      console.log(`📥 Joined room: ${roomId}`);
    });

    // Handle sending a new message
    socket.on("send-message", async ({ roomId, senderId, content }) => {
      try {
        // Save to DB
        const message = await Message.create({
          sender: senderId,
          chatRoom: roomId,
          content,
        });

        await ChatRoom.findByIdAndUpdate(roomId, { lastMessage: message._id });

        // Emit to all users in room
        io.to(roomId).emit("receive-message", {
          _id: message._id,
          sender: senderId,
          chatRoom: roomId,
          content,
          createdAt: message.createdAt,
        });

        console.log(`📤 Message sent to room ${roomId}`);
      } catch (err) {
        console.error("Socket message error:", err.message);
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });
};

module.exports = socketSetup;
