var express = require("express");
const { getAnswers, createAnswers } = require("../controllers/Answers");

var router = express.Router();

// Not needed
// POST '/auth/signup'
router.get("/list", getAnswers);
router.post("/create", createAnswers);
module.exports = router;
