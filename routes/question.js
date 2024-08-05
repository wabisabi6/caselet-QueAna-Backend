var express = require("express");
const {
  getQuestions,
  createQuestions,
  getQuestionById,
  getExamQuestion,
  getExamQuestionResult,
  updateQuestionReflection,
  getQuestionReflection,
} = require("../controllers/Questions");
const { checkAuth } = require("../middleware/auth_validate");

var router = express.Router();

// Not needed
// POST '/auth/signup'
router.get("/list", getQuestions);
router.post("/create", createQuestions);
router.get("/question", getQuestionById);
router.get("/get_user_question", checkAuth, getExamQuestion);
router.get("/get_user_question_result", checkAuth, getExamQuestionResult);
router.post('/updateQuestionReflection', checkAuth, updateQuestionReflection);
router.get('/getQuestionReflection', getQuestionReflection);

module.exports = router;
