const mongoose = require("mongoose");
const Message = require("../models/MessageModel");

exports.getMessages = async (req, res) => {
  console.log("🔍 Raw friendId from URL:", req.params.friendId);
  console.log("🔐 Raw userId from JWT:", req.userId);
  

  const userId = mongoose.Types.ObjectId.isValid(req.userId) ? new mongoose.Types.ObjectId(req.userId) : null;
  const friendId = mongoose.Types.ObjectId.isValid(req.params.friendId) ? new mongoose.Types.ObjectId(req.params.friendId) : null;

  if (!userId || !friendId) {
    console.log("❌ Invalid ObjectId(s)");
    return res.status(400).json({ message: "Invalid user or friend ID" });
  }

  try {
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: friendId },
        { sender: friendId, receiver: userId },
      ],
    }).sort({ createdAt: 1 });

    console.log("📬 Found messages:", messages);
    res.json(messages);
  } catch (err) {
    console.error("💥 Query failed:", err);
    res.status(500).json({ message: "Failed to load messages", error: err.message });
  }
};
