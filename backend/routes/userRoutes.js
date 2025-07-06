const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const User = require('../models/UserModel');

// GET /api/users/search?q=username
router.get('/search', protect, async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ message: "Missing search query" });

  try {

    const users = await User.find({
      username: { $regex: q, $options: "i" },
      _id: { $ne: req.userId }, // ✅ Exclude current user
    }).select("username email");

    res.json(users);
  } catch (err) {
    console.error("❌ Search error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
