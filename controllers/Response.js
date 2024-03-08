const ResponseModel = require("../models/Response");
const RESPONSE_FIELD = [
  "exam_id",
  "question_id",
  "answer_id",
  "user_id",
  "confidence",
  "comment",
];
const { fetchUserIdFromToken } = require("../middleware/auth_validate");
const { Types } = require("mongoose");

exports.getRespose = async (req, res, next) => {
  const userId = await fetchUserIdFromToken(
    req.headers.authorization.split(" ")[1]
  );
  const response = await ResponseModel.aggregate([
    {
      $match: {
        user_id: Types.ObjectId(userId),
        question_id: Types.ObjectId(req.query.question_id),
        exam_id: Types.ObjectId(req.query.exam_id),
      },
    },
    {
      $lookup: {
        from: "questions",
        localField: "question_id",
        foreignField: "_id",
        as: "question",
      },
    },
    {
      $unwind: {
        path: "$question",
      },
    },
  ]);

  return res.status(200).json({ sucess: true, response });
};

exports.getQuestionWiseResponse = async (req, res, next) => {
  const userId = await fetchUserIdFromToken(
    req.headers.authorization.split(" ")[1]
  );
  console.log("----User ID was extracted----")
  const response = await ResponseModel.aggregate([
    {
      $match: {
        user_id: Types.ObjectId(userId),
        exam_id: Types.ObjectId(req.query.exam_id),
      },
    },
    {
      $lookup: {
        from: "questions",
        localField: "question_id",
        foreignField: "_id",
        as: "question",
      },
    },
    {
      $unwind: {
        path: "$question",
      },
    },
    {
      $lookup: {
        from: "answers",
        localField: "answer_id",
        foreignField: "_id",
        as: "answer",
      },
    },
    {
      $unwind: {
        path: "$answer",
      },
    },
    {
      $group: {
        _id: "$_id",
        originalDoc: { $first: "$$ROOT" },
        answers: { $push: "$answer" }
      }
    },
    {
      $addFields: {
        "originalDoc.answer": "$answers" // Integrate the 'answers' array back into the original document structure
      }
    },
    {
      $replaceRoot: { newRoot: "$originalDoc" } // Replace the root to cleanup the structure
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
      },
    },
  ]);

  console.log("response value was created", response)
  console.log("answer object content in response: ", response[0].answer)
  let questionList = [];
  let correctList = [];
  let finalOutPut = [];
  let questionCount = 0;
  if (response.length > 0) {
    console.log("easy");

    console.log("total questions in response: ", parseInt(response[0].exam.total_questions))
    console.log("total length of response: ", response.length)
    // if (parseInt(response[0].exam.total_questions) != response.length) {
    //   console.log(parseInt(response[0].exam.total_questions, response.length));
    //   return res.status(400).json({ success: false, message: "empty" });
    // } else {
      console.log("Everything alright!")
      //questionCount = response.length;
      for (let index = 0; index < response.length; index++) {
        const element = response[index];
        questionList.push(element.question.question_no);
        correctList.push(element.answer.is_correct);
      }
    // }

    for (
      let index = 1;
      index <= parseInt(response[0].exam.total_questions);
      index++
    ) {
      finalOutPut.push({
        question_no: index,
        correct: correctList[questionList.indexOf(index)],
      });
    }

    console.log(finalOutPut, "OPtoek");
    return res.status(200).json({ success: true, body: finalOutPut });
  }
  return res.status(400).json({ success: false, message: "response 0" });
};

exports.createRespose = async (req, res, next) => {

  console.log("Response is being created based on user's answer.")
  const userId = await fetchUserIdFromToken(
    req.headers.authorization.split(" ")[1]
  );

  console.log(userId, "Du");
  let body = req.body;
  body.user_id = userId;

  console.log("The body of the submitted answer: ")
  console.log(body, "Body");
  keys = Object.keys(body);
  for (let index = 0; index < RESPONSE_FIELD.length; index++) {
    const key = RESPONSE_FIELD[index];

    // console.log(!body[key]);
    if (!keys.includes(key) || !body[key]) {
      console.log(key);
      return res
        .status(400)
        .json({ sucess: false, body: `${key} not found, please enter it ` });
    }
  }

  //Check if response already donefor that question

  // const responseCheck = await ResponseModel.findOne({
  //   user_id: userId,
  //   question_id: body.question_id,
  // });

  // if (!(responseCheck == null)) {
  //   return res.status(400).json({
  //     success: false,
  //     body: "Already submitted response for this question",
  //   });
  // }

  const response = await ResponseModel.create(body);
  res.status(200).json({ sucess: true, response });
};
