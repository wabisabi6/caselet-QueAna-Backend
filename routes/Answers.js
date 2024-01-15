var express = require("express");
const { getAnswer, createAnswer } = require("../controllers/Answer");

var router = express.Router();

// Not needed
// POST '/auth/signup'
router.get("/list", getAnswer);
router.post("/create", createAnswer);
module.exports = router;
