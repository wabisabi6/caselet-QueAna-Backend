var express = require("express");
const {
  getBehaviour,
  createBehaviour,
  updateBehaviour,
  getUserBehaviour,
} = require("../controllers/Behaviour");

var router = express.Router();

// Not needed
// POST '/auth/signup'
router.get("/fetch", getUserBehaviour);
router.post("/create", createBehaviour);
router.patch("/update", updateBehaviour);
module.exports = router;
