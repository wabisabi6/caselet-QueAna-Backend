const QuestionsModel = require("../models/Questions");
const fs = require("fs");
var base64ToImage = require("base64-to-image");
const { v4: uuidv4 } = require("uuid");
const { Types } = require("mongoose");
const QUESTION_FIELDS = ["question", "exam_id", "explain", "question_no"];
const { fetchUserIdFromToken } = require("../middleware/auth_validate");
const ResponseModel = require("../models/Response");
const ExamModel = require("../models/Exams");
const ScheduledExamModel = require("../models/ScheduledExam");
const BehaviourModel = require("../models/Behaviour");
const mongoose = require("mongoose");

exports.getQuestions = async (req, res, next) => {
  const questions = await QuestionsModel.find({
    exam_id: req.query.exam_id,
  }).sort({ question_no: 1 });
  res.status(200).json({ sucess: true, questions });
};

exports.getQuestionById = async (req, res, next) => {
  // console.lo g(questi);
  const question = await QuestionsModel.aggregate([
    { $match: { _id: new Types.ObjectId(req.query.question_id) } },
    {
      $lookup: {
        from: "answers",
        localField: "_id",
        foreignField: "question_id",
        as: "answers",
      },
    },
  ]);

  res.status(200).json({ success: true, question });
};

exports.createQuestions = async (req, res, next) => {
  let body = req.body;
  keys = Object.keys(body);
  console.log(keys, "This is question creation in backend.");
  console.log("This is the question body : ", body)

  try{

    for (let index = 0; index < QUESTION_FIELDS.length; index++) {
      const key = QUESTION_FIELDS[index];

      // console.log(!body[key]);
      if (!keys.includes(key) || !body[key]) {
        console.log(key);
        return res
          .status(400)
          .json({ sucess: false, body: `${key} not found, please enter it ` });
      }
    }

  }
  catch(error){
    console.log("Error : ", error)

  }

  //Image upload herer
  let imagePath = "";

  if (req.body.image) {
    let buff = Buffer.from(req.body.image, "base64");
    console.log(buff, "his ");
    imagePath = uuidv4();
    base64ToImage(req.body.image, `public/images/`, {
      fileName: imagePath,
      type: "png",
    });
  }
  body.image = req.body.image ? `images/${imagePath}.png` : "";

  const question = await QuestionsModel.create(body);
  res.status(200).json({ sucess: true, question });
};

exports.updateImagesForQuestion = async (req, res, next) => {
  let body = req.body;
  if (body.question_id) {
    res.status(404).json({ success: false, message: "Question Id not found." });
  }
  let image = req.file;
  //Save the file

  //Update the url
  const updateQuestion = await QuestionsModel.updateOne(
    { _id: body.question_id },
    {
      //    images :
    }
  );
};

exports.updateQuestionReflection = async (req, res, next) => {
  try {
    const { question_id, post_reflection_explanation_understanding, post_reflection_explanation_clarity } = req.body;

    const updateFields = {};

    if (post_reflection_explanation_understanding) {
      updateFields['post_reflection_explanation_understanding'] = post_reflection_explanation_understanding;
    }

    if (post_reflection_explanation_clarity) {
      updateFields['post_reflection_explanation_clarity'] = post_reflection_explanation_clarity;
    }

    const result = await QuestionsModel.updateOne(
      { _id: Types.ObjectId(question_id) },
      { $set: updateFields }
    );

    res.status(200).json({ success: true, result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "An error occurred while updating the question reflection." });
  }
};

exports.getQuestionReflection = async (req, res, next) => {
  try {
    const { question_id } = req.query;
    const question = await QuestionsModel.findById(question_id).select('post_reflection_explanation_understanding post_reflection_explanation_clarity');
    res.status(200).json({ success: true, question });
  } catch (error) {
    console.error(error);
    res.status (500).json({ success: false, message: "An error occurred while fetching the question reflection." });
  }
};


exports.getExamQuestion = async (req, res, next) => {
  const userId = await fetchUserIdFromToken(
    req.headers.authorization.split(" ")[1]
  );
  let examID = req.query.exam_id;
  console.log("Type of req.query.exam_id", typeof req.query.exam_id)

  let questionNo = req.query.question_no;
  console.log("Type of req.query.question_no", typeof req.query.question_no)

  if (!questionNo) {
    return res
      .status(401)
      .json({ success: false, message: "Question no does not exists" });
  }

  const fetchExam = await ExamModel.findOne({ _id: examID });
  const fetchScheduledExam = await ScheduledExamModel.findOne({selectedExamId: examID});

  if (fetchExam == null) {
    return res
      .status(401)
      .json({ success: false, message: "Exam does not exists" });
  }

  if (fetchExam.total_questions < questionNo) {
    return res
      .status(401)
      .json({ success: false, message: "Question no is invalid" });
  }

  console.log("Start Time: ", fetchScheduledExam.start_time)
  console.log("End Time: ", fetchScheduledExam.end_time)

  if (fetchScheduledExam.start_time < new Date() && new Date() < fetchScheduledExam.end_time) {
    console.log(fetchScheduledExam.start_time < new Date());
  } else {
    console.log(fetchScheduledExam.start_time < new Date());
    return res.status(401).json({
      success: false,
      message: "Exam is either completed or not started. Line 211",
    });
  }

  //CHECK IF BEHAVIOUR
  const behaviour = await BehaviourModel.find({
    exam_id: examID,
    user_id: userId,
  });

  console.log("Behaviour stage completed")

  if (behaviour.length == 0) {
    return res.status(400).json({
      success: false,
      message: "Reflection Required",
    });
  }

  console.log("Reflection Required stage completed")

  //This is the next question of exam
  console.log("exam", examID, questionNo);

  let nextQuestion = await QuestionsModel.aggregate(
    questionAggregation(examID, questionNo)
  );

  console.log("Next question data:", nextQuestion);

  return res.status(200).json({
    success: true,
    question: nextQuestion[0],
  });
};

exports.getExamQuestionResult = async (req, res, next) => {
  const userId = await fetchUserIdFromToken(
    req.headers.authorization.split(" ")[1]
  );
  let examID = req.query.exam_id;
  let questionNo = req.query.question_no;
  if (!questionNo) {
    return res
      .status(401)
      .json({ success: false, message: "Question no does not exists" });
  }

  const fetchExam = await ExamModel.findOne({ _id: examID });
  const fetchScheduledExam = await ScheduledExamModel.findOne({selectedExamId: examID});

  if (fetchExam == null) {
    return res
      .status(401)
      .json({ success: false, message: "Exam does not exists" });
  }

  if (fetchExam.total_questions < questionNo) {
    return res
      .status(401)
      .json({ success: false, message: "Question no is invalid" });
  }
  if (fetchScheduledExam.start_time < new Date() && new Date() < fetchScheduledExam.end_time) {
    console.log(fetchScheduledExam.start_time < new Date());
  } else {
    console.log(fetchScheduledExam.start_time < new Date());
    return res.status(401).json({
      success: false,
      message: "Exam is either completed or not started. Line 269",
    });
  }

  //CHECK IF BEHAVIOUR
  const behaviour = await BehaviourModel.find({
    exam_id: examID,
    user_id: userId,
  });

  if (behaviour.length == 0) {
    return res.status(400).json({
      success: false,
      message: "Reflection Required",
    });
  }

  //This is the next question of exam
  let nextQuestion = await QuestionsModel.aggregate(
    questionAggregationWithSolution(examID, questionNo)
  );

  return res.status(200).json({
    success: true,
    question: nextQuestion[0],
  });
};

const questionAggregation = (exam_id, question_no) => {
  return [
    {
      $match: {
        exam_id: Types.ObjectId(exam_id),
        question_no: parseInt(question_no),
      },
    },
    {
      $lookup: {
        from: "exams",
        localField: "exam_id",
        foreignField: "_id",
        as: "exam",
      },
    },
    {
      $unwind: {
        path: "$exam",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "answers",
        let: {
          question_id: "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$question_id", "$$question_id"],
              },
            },
          },
          {
            $project: {
              is_correct: 0,
              question_id: 0,
            },
          },
        ],
        as: "answers",
      },
    },
  ];
};

const questionAggregationWithSolution = (exam_id, question_no) => {
  return [
    {
      $match: {
        exam_id: Types.ObjectId(exam_id),
        question_no: parseInt(question_no),
      },
    },
    {
      $lookup: {
        from: "exams",
        localField: "exam_id",
        foreignField: "_id",
        as: "exam",
      },
    },
    {
      $unwind: {
        path: "$exam",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "answers",
        let: {
          question_id: "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$question_id", "$$question_id"],
              },
            },
          },
          {
            $project: {
              // is_correct: 0,
              question_id: 0,
            },
          },
        ],
        as: "answers",
      },
    },
  ];
};
