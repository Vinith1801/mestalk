const User = require("../models/UserModel");
const generateToken = require("../utils/generateToken");

exports.registerUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: "All fields are required." });

  const userExists = await User.findOne({ username });
  if (userExists)
    return res.status(400).json({ message: "Username already exists." });

  const user = await User.create({ username, password });

  res.status(201).json({
    _id: user._id,
    username: user.username,
    token: generateToken(user._id),
  });
};

exports.loginUser = async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  res.json({
    _id: user._id,
    username: user.username,
    token: generateToken(user._id),
  });
};
