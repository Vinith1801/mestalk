const FriendRequest = require("../models/FriendRequestModel");
const User = require("../models/UserModel");

// Send friend request
exports.sendRequest = async (req, res) => {
  const from = req.userId;
  const { to } = req.params;

  if (from === to) return res.status(400).json({ message: "Cannot add yourself" });

  const existing = await FriendRequest.findOne({ from, to });
  if (existing) return res.status(400).json({ message: "Request already sent" });

  await FriendRequest.create({ from, to });
  res.status(201).json({ message: "Friend request sent" });
};

// Accept friend request
exports.acceptRequest = async (req, res) => {
  const { requestId } = req.params;

  const request = await FriendRequest.findById(requestId);
  if (!request || request.to.toString() !== req.userId)
    return res.status(404).json({ message: "Request not found" });

  request.status = "accepted";
  await request.save();

  await User.findByIdAndUpdate(request.from, { $addToSet: { friends: request.to } });
  await User.findByIdAndUpdate(request.to, { $addToSet: { friends: request.from } });

  res.json({ message: "Friend request accepted" });
};

// Reject friend request
exports.rejectRequest = async (req, res) => {
  const { requestId } = req.params;
  const request = await FriendRequest.findById(requestId);

  if (!request || request.to.toString() !== req.userId)
    return res.status(404).json({ message: "Request not found" });

  request.status = "rejected";
  await request.save();

  res.json({ message: "Friend request rejected" });
};

// Get list of friends
exports.getFriends = async (req, res) => {
  const user = await User.findById(req.userId).populate("friends", "username email avatarUrl status");
  res.json(user.friends);
};

// Get pending friend requests
exports.getPendingRequests = async (req, res) => {
  const requests = await FriendRequest.find({ to: req.userId, status: "pending" }).populate("from", "username email");
  res.json(requests);
};

// Block a user
exports.blockUser = async (req, res) => {
  const { targetId } = req.params;

  await User.findByIdAndUpdate(req.userId, { $addToSet: { blocked: targetId } });
  res.json({ message: "User blocked" });
};

// Unblock a user
exports.unblockUser = async (req, res) => {
  const { targetId } = req.params;

  await User.findByIdAndUpdate(req.userId, { $pull: { blocked: targetId } });
  res.json({ message: "User unblocked" });
};
