var express = require("express");
const {
  getRespose,
  createRespose,
  getQuestionWiseResponse,
  deleteUserResponses,
  updateQuestionReflection,
  getQuestionReflection,
  deleteQuestionReflection,
  getPostReflectionPerQuestionStatus,
  updatePostReflectionPerQuestionStatus

} = require("../controllers/Response");

var router = express.Router();
const { checkAuth } = require("../middleware/auth_validate");

// Not needed
// POST '/auth/signup'
router.get("/get_user_response", getRespose);
router.post("/create", checkAuth, createRespose);
router.get("/get_question_report", checkAuth, getQuestionWiseResponse);
router.delete("/delete_user_responses", checkAuth, deleteUserResponses);
router.post('/updateQuestionReflection', checkAuth, updateQuestionReflection);
router.get('/getQuestionReflection', checkAuth, getQuestionReflection);
router.delete('/deleteQuestionReflection', checkAuth, deleteQuestionReflection);
router.get('/getPostReflectionPerQuestionStatus', checkAuth, getPostReflectionPerQuestionStatus);
router.put('/updatePostReflectionPerQuestionStatus', checkAuth, updatePostReflectionPerQuestionStatus);
module.exports = router;
