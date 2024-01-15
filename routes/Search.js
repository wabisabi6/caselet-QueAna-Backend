var express = require("express");
const { getSearch, createSearch } = require("../controllers/Search");

var router = express.Router();

// Not needed
// POST '/auth/signup'
router.get("/list", getSearch);
router.post("/create", createSearch);
module.exports = router;
