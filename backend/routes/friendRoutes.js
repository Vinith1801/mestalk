const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  sendRequest,
  acceptRequest,
  rejectRequest,
  getFriends,
  getPendingRequests,
  blockUser,
  unblockUser,
} = require("../controllers/friendController");

router.use(protect);

router.post("/request/:to", sendRequest);
router.post("/accept/:requestId", acceptRequest);
router.post("/reject/:requestId", rejectRequest);

router.get("/list", getFriends);
router.get("/requests", getPendingRequests);

router.post("/block/:targetId", blockUser);
router.post("/unblock/:targetId", unblockUser);

module.exports = router;
