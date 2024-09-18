var express = require("express");
const {
  getBehaviour,
  createBehaviour,
  updateBehaviour,
  getUserBehaviour,
  deleteUserBehaviour,
} = require("../controllers/Behaviour");

var router = express.Router();
const { checkAuth } = require("../middleware/auth_validate");

// Not needed
// POST '/auth/signup'
router.get("/fetch", getUserBehaviour);
router.post("/create", createBehaviour);
router.patch("/update", updateBehaviour);
router.delete("/delete_user_behaviour", checkAuth, deleteUserBehaviour);
module.exports = router;
