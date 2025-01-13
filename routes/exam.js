var express = require("express");
const {
  getExam,
  createExam,
  getExamDetails,
  deleteExam,
  getScheduledExam,
  getScheduledExamsById,
  getScheduledExamsList,
  scheduleExam,
} = require("../controllers/Exam");
const { checkAuth } = require("../middleware/auth_validate");

var router = express.Router();

// Not needed
// POST '/auth/signup'
router.get("/list", getExam);
router.get("/info/:exam_id", getExamDetails);
router.get("/delete/:exam_id", deleteExam);
router.post("/create", createExam);
router.get("/schedule", checkAuth, getScheduledExam);

//newly added scheduleExam
router.post("/scheduleExam", scheduleExam)
router.post("/getScheduledExamsById", getScheduledExamsById)
router.get("/getScheduledExamsList", getScheduledExamsList)
module.exports = router;
