const bcrypt = require("bcryptjs");
const User = require("../models/UserModel");
const generateToken = require("../utils/generateToken");

exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, email, passwordHash });

    res.status(201).json({
      user: { id: newUser._id, username: newUser.username, email: newUser.email },
      token: generateToken(newUser._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Signup failed", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    res.json({
      user: { id: user._id, username: user.username, email: user.email },
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};
