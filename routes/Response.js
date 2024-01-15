var express = require("express");
const {
  getRespose,
  createRespose,
  getQuestionWiseResponse,
} = require("../controllers/Response");

var router = express.Router();
const { checkAuth } = require("../middleware/auth_validate");

// Not needed
// POST '/auth/signup'
router.get("/get_user_response", getRespose);
router.post("/create", checkAuth, createRespose);
router.get("/get_question_report", checkAuth, getQuestionWiseResponse);
module.exports = router;
