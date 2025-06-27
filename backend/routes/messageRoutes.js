const express = require("express");
const router = express.Router();
const {
  sendMessage,
  getMessages,
  accessChat,
} = require("../controllers/messageController");
const protect = require("../middleware/authMiddleware");

router.post("/access", protect, accessChat);          // Access or create chat room
router.get("/:roomId", protect, getMessages);         // Get messages for a room
router.post("/", protect, sendMessage);               // Send a message

module.exports = router;
