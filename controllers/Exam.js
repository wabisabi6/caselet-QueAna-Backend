const { errResponse } = require("../middleware/ErrorResponse");
const ExamModel = require("../models/Exams");

const { Types } = require("mongoose");
const EXAM_FIELDS = [
  "name",
  "start_time",
  "end_time",
  "problem_context",
  "data_summary",
  "difficulty",
  "total_questions",
];
exports.getExam = async (req, res, next) => {
  const exam = await ExamModel.find();
  return res.status(200).json({ sucess: true, exam });
};

exports.getExamDetails = async (req, res, next) => {
  // console.log(req);
  if (!req.params.exam_id) {
    return res.status(400).json({ sucess: false, exam: "Exam id is invalid" });
  }
  const exam = await ExamModel.aggregate([
    { $match: { _id: new Types.ObjectId(req.params.exam_id) } },
    {
      $lookup: {
        from: "questions",
        localField: "_id",
        foreignField: "exam_id",
        as: "question",
      },
    },
  ]);

  // console.log(exam);
  let totalQuestions = exam[0].total_questions;
  let spotsTaken = await exam[0].question.map((question) => {
    return question.question_no;
  });
  let questions_available = [];

  for (let index = 1; index <= totalQuestions; index++) {
    // console.log("as");
    console.log(spotsTaken);
    if (!spotsTaken.includes(index)) {
      console.log("takn", index);
      questions_available.push(index);
    }
  }
  exam[0].questions_available = questions_available;

  return res.status(200).json({ sucess: true, exam });
};

//Get list of exams
exports.getScheduledExam = async (req, res, next) => {
  const exam = await ExamModel.aggregate([
    {
      $match: {
        end_time: {
          $gte: new Date(),
        },
      },
    },
    {
      $sort: {
        start_time: -1,
      },
    },
  ]);

  return res.status(200).json({ success: true, exam });
};

exports.createExam = async (req, res, next) => {
  console.log(req.body);

  if (req.method == "OPTIONS") {
    return  res.status(200);
  }

  let body = req.body;
  keys = Object.keys(body);
  console.log(keys, "This is dflka");
  for (let index = 0; index < EXAM_FIELDS.length; index++) {
    const key = EXAM_FIELDS[index];
    // console.log(!body[key]);
    if(key != "difficulty")
    {
      if (!keys.includes(key) || !body[key]) {
        console.log(key);
        return res
          .status(400)
          .json({ sucess: false, body: `${key} not found, please enter it ` });
      }
    }
  }
  const question_bank = await ExamModel.create(body);

  return res.status(200).json({ success: true, body: question_bank });
};
