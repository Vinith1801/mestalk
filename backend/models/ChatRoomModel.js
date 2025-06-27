const mongoose = require("mongoose");

const chatRoomSchema = new mongoose.Schema(
  {
    name: { type: String }, // Optional for group chats
    isGroup: { type: Boolean, default: false },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatRoom", chatRoomSchema);
