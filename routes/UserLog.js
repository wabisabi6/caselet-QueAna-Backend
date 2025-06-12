var express = require("express");
const { createLog } = require("../controllers/UserLog");
const { checkAuth } = require("../middleware/auth_validate");
const { logRunningNotesEdit } = require('../controllers/UserLog');


var router = express.Router();

// Not needed
// POST '/auth/signup'
// router.get("/list", getSearch);
router.post("/create", checkAuth, createLog);
router.post('/logRunningNotesEdit', logRunningNotesEdit);

module.exports = router;
