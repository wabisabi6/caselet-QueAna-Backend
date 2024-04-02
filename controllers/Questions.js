const QuestionsModel = require("../models/Questions");
const fs = require("fs");
var base64ToImage = require("base64-to-image");
const { v4: uuidv4 } = require("uuid");
// c { nanoid } from "nanoid";
const { Types } = require("mongoose");
const QUESTION_FIELDS = ["question", "exam_id", "explain", "question_no"];
const { fetchUserIdFromToken } = require("../middleware/auth_validate");
const ResponseModel = require("../models/Response");
const ExamModel = require("../models/Exams");
const BehaviourModel = require("../models/Behaviour");

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

//Get question for each user [OLD]
// exports.getExamQuestion = async (req, res, next) => {
//   const userId = await fetchUserIdFromToken(
//     req.headers.authorization.split(" ")[1]
//   );
//   let examID = req.query.exam_id;

//   const fetchExam = await ExamModel.findOne({ _id: examID });
//   if (fetchExam == null) {
//     return res
//       .status(401)
//       .json({ success: false, message: "Exam does not exists" });
//   }

//   if (fetchExam.start_time < new Date() && new Date() < fetchExam.end_time) {
//     console.log(fetchExam.start_time < new Date());
//   } else {
//     console.log(fetchExam.start_time < new Date());
//     return res.status(401).json({
//       success: false,
//       message: "Exam is either completed or not started.",
//     });
//   }

//   //CHECK IF BEHAVIOUR
//   const behaviour = await BehaviourModel.find({
//     exam_id: examID,
//     user_id: userId,
//   });

//   if (behaviour.length == 0) {
//     return res.status(400).json({
//       success: false,
//       message: "Reflection Required",
//     });
//   }

//   //Fetch user last reponse.
//   const response = await ResponseModel.aggregate([
//     { $match: { exam_id: examID, user_id: userId } },
//     {
//       $sort: { created_on: -1 },
//     },
//   ]);

//   if (response.length == 0) {
//     //This is the first question of exam
//     const question = await QuestionsModel.aggregate(
//       questionAggregation(examID, 1)
//     );

//     if (question.length == 0) {
//       return res.status(401).json({
//         success: false,
//         message: "Questions does not exists in this exam  ",
//       });
//     }

//     return res.status(200).json({
//       success: false,
//       question: question[0],
//     });
//   } else {
//     let lastQuestionId = response[0].question_id;

//     let lastAttemptedQuestion = await QuestionsModel.findOne({
//       _id: lastQuestionId,
//     });

//     //This is the next question of exam
//     let nextQuestion = await QuestionsModel.aggregate(
//       questionAggregation(examID, lastAttemptedQuestion.question_no + 1)
//     );

//     console.log(nextQuestion);
//     return res.status(200).json({
//       success: false,
//       question: nextQuestion,
//     });
//   }
// };
exports.getExamQuestion = async (req, res, next) => {
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
  if (fetchExam.start_time < new Date() && new Date() < fetchExam.end_time) {
    console.log(fetchExam.start_time < new Date());
  } else {
    console.log(fetchExam.start_time < new Date());
    return res.status(401).json({
      success: false,
      message: "Exam is either completed or not started.",
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
  console.log("exam", examID, questionNo);
  let nextQuestion = await QuestionsModel.aggregate(
    questionAggregation(examID, questionNo)
  );

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
  if (fetchExam.start_time < new Date() && new Date() < fetchExam.end_time) {
    console.log(fetchExam.start_time < new Date());
  } else {
    console.log(fetchExam.start_time < new Date());
    return res.status(401).json({
      success: false,
      message: "Exam is either completed or not started.",
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
