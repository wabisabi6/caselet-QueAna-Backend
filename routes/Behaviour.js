var express = require("express");
const {
  getBehaviour,
  createBehaviour,
  updateBehaviour,
  getUserBehaviour,
  updateBehaviourTaskSubmission
} = require("../controllers/Behaviour");

var router = express.Router();

// Not needed
// POST '/auth/signup'
router.get("/fetch", getUserBehaviour);
router.post("/create", createBehaviour);
router.patch("/update", updateBehaviour);
router.patch("/updateTaskSubmission", updateBehaviourTaskSubmission);
module.exports = router;
