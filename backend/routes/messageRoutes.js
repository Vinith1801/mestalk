const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { getMessages } = require("../controllers/messageController");
// const authMiddleware = require("../middleware/authMiddleware");

router.get("/:userId", protect, getMessages);
router.get("/with/:friendId", protect, getMessages);

module.exports = router;
