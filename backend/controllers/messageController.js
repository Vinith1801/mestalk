const Message = require("../models/MessageModel");

exports.getMessages = async (req, res) => {
  const { userId } = req.params;
  const currentUser = req.userId;

  try {
    const messages = await Message.find({
      $or: [
        { sender: currentUser, receiver: userId },
        { sender: userId, receiver: currentUser }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};
