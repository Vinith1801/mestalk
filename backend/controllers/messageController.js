const ChatRoom = require("../models/ChatRoomModel");
const Message = require("../models/MessageModel");

// Create or find a room (1-1 chat)
exports.accessChat = async (req, res) => {
  const { userId } = req.body;

  let room = await ChatRoom.findOne({
    isGroup: false,
    members: { $all: [req.user._id, userId], $size: 2 },
  }).populate("members", "-password");

  if (!room) {
    room = await ChatRoom.create({
      members: [req.user._id, userId],
    });
  }

  res.status(200).json(room);
};

// Fetch all messages for a room
exports.getMessages = async (req, res) => {
  const { roomId } = req.params;

  const messages = await Message.find({ chatRoom: roomId })
    .populate("sender", "username")
    .sort("createdAt");

  res.json(messages);
};

// Send a new message
exports.sendMessage = async (req, res) => {
  const { roomId, content } = req.body;

  const message = await Message.create({
    sender: req.user._id,
    chatRoom: roomId,
    content,
  });

  await ChatRoom.findByIdAndUpdate(roomId, { lastMessage: message._id });

  res.status(201).json(message);
};
