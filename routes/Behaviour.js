var express = require("express");
const {
  getBehaviour,
  saveCommentsDataSummary,
  saveCommentsProblemContext,
  createBehaviour,
  updateBehaviour,
  getUserBehaviour,
  deleteUserBehaviour,
  saveRunningNotes,
} = require("../controllers/Behaviour");

var router = express.Router();
const { checkAuth } = require("../middleware/auth_validate");

// Not needed
// POST '/auth/signup'
router.get("/fetch", getUserBehaviour);
router.post("/create", createBehaviour);
router.patch("/update", updateBehaviour);
router.delete("/delete_user_behaviour", checkAuth, deleteUserBehaviour);
router.post('/saveCommentsDataSummary', saveCommentsDataSummary);
router.post('/saveCommentsProblemContext', saveCommentsProblemContext);
router.post('/saveRunningNotes', saveRunningNotes);
module.exports = router;
