var express = require("express");
const { createLog } = require("../controllers/UserLog");
const { checkAuth } = require("../middleware/auth_validate");

var router = express.Router();

// Not needed
// POST '/auth/signup'
// router.get("/list", getSearch);
router.post("/create", checkAuth, createLog);
module.exports = router;
