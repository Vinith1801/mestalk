const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { getMessages } = require("../controllers/messageController");

router.get("/:userId", protect, getMessages);

module.exports = router;
