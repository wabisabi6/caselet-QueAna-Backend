const ResponseModel = require("../models/Response");
const MANDATORY_RESPONSE_FIELD = [
  "exam_id",
  "question_id",
  "answer_id",
  "user_id",
  "confidence"
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
  if (response.length > 0) 
  {
    console.log("easy");

    console.log("total questions in response: ", parseInt(response[0].exam.total_questions))
    console.log("total length of response: ", response.length)
    console.log("Everything alright!")
    for (let index = 0; index < response.length; index++) {
      const element = response[index];
      questionList.push(element.question.question_no);
      correctList.push(element.answer.is_correct);
    }

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
  for (let index = 0; index < MANDATORY_RESPONSE_FIELD.length; index++) {
    const key = MANDATORY_RESPONSE_FIELD[index];

    if (!keys.includes(key) || !body[key]) {
      console.log(key);
      return res
        .status(400)
        .json({ sucess: false, body: `${key} not found, please enter it ` });
    }
  }

  const response = await ResponseModel.create(body);
  res.status(200).json({ sucess: true, response });
};

// Delete all responses for a user based on exam_id and user_id
exports.deleteUserResponses = async (req, res, next) => {
  try {
    const userId = await fetchUserIdFromToken(req.headers.authorization.split(" ")[1]);
    const examId = req.body.exam_id;

    // Check if exam_id is provided
    if (!examId) {
      return res.status(400).json({
        success: false,
        message: "exam_id is required",
      });
    }

    // Delete Response entries for the user and exam
    await ResponseModel.deleteMany({
      exam_id: Types.ObjectId(examId),
      user_id: Types.ObjectId(userId),
    });

    return res.status(200).json({
      success: true,
      message: "User responses deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user responses:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error,
    });
  }
};


exports.updateQuestionReflection = async (req, res, next) => {
  try {    
    const user_id = await fetchUserIdFromToken(req.headers.authorization.split(" ")[1]);
    
    const { question_id, exam_id, post_reflection_explanation_understanding, post_reflection_explanation_clarity } = req.body;

    const updateFields = {};

    if (post_reflection_explanation_understanding !== undefined) {
      updateFields['post_reflection_explanation_understanding'] = post_reflection_explanation_understanding;
    }

    if (post_reflection_explanation_clarity !== undefined) {
      updateFields['post_reflection_explanation_clarity'] = post_reflection_explanation_clarity;
    }

    const result = await ResponseModel.updateOne(
      { question_id: Types.ObjectId(question_id), user_id: Types.ObjectId(user_id), exam_id: Types.ObjectId(exam_id) },
      { $set: updateFields },
      { upsert: true } // Create the document if it doesn't exist
    );

    res.status(200).json({ success: true, result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "An error occurred while updating the question reflection." });
  }
};


exports.deleteQuestionReflection = async (req, res, next) => {
  try {
    const user_id = await fetchUserIdFromToken(req.headers.authorization.split(" ")[1]);
    const { exam_id} = req.body;

    // Find all question reflections by both exam_id and user_id and delete them
    const result = await ResponseModel.updateMany(
      { exam_id: Types.ObjectId(exam_id), user: Types.ObjectId(user_id) },
      {
        $unset: {
          post_reflection_explanation_understanding: "",
          post_reflection_explanation_clarity: ""
        }
      }
    );

    // If no documents were modified, return a 404 response
    if (result.nModified === 0) {
      return res.status(404).json({ success: false, message: "No reflections found for the given exam and user." });
    }

    // Return a success response
    res.status(200).json({ success: true, message: "Reflections deleted successfully for all questions in the exam." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "An error occurred while deleting the question reflections." });
  }
};


exports.getQuestionReflection = async (req, res, next) => {
  try {    
    const user_id = await fetchUserIdFromToken(req.headers.authorization.split(" ")[1]);
    const { question_id, exam_id } = req.query;

    const question = await ResponseModel.findOne({
      question_id: Types.ObjectId(question_id),
      user_id: Types.ObjectId(user_id),
      exam_id: Types.ObjectId(exam_id)
    }).select('post_reflection_explanation_understanding post_reflection_explanation_clarity');
    
    // Check if the question reflection exists
    if (!question) {
      return res.status(404).json({ success: false, message: "Question reflection not found for the given user and exam." });
    }

    res.status(200).json({ success: true, question });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "An error occurred while fetching the question reflection." });
  }
};

exports.getPostReflectionPerQuestionStatus = async (req, res, next) => {
  try {
    const user_id = await fetchUserIdFromToken(req.headers.authorization.split(" ")[1]);
    const { question_id, exam_id } = req.query;

    // Find the response by user, question, and exam
    const response = await ResponseModel.findOne({
      user_id: Types.ObjectId(user_id),
      question_id: Types.ObjectId(question_id),
      exam_id: Types.ObjectId(exam_id)
    });
    // Return the status of post reflection
    return res.status(200).json({
      success: true,
      is_post_reflection_per_question_submitted: response.is_post_reflection_per_question_submitted
    });
  } catch (error) {
    console.error("Error fetching post reflection status:", error);
    return res.status(500).json({ success: false, message: "An error occurred while fetching post reflection status." });
  }
};

// Controller to update the post reflection status
exports.updatePostReflectionPerQuestionStatus = async (req, res, next) => {
  try {    
    const user_id = await fetchUserIdFromToken(req.headers.authorization.split(" ")[1]);

    const {question_id, exam_id, is_post_reflection_per_question_submitted } = req.body;

    // Find the response by user, question, and exam and update the post reflection status
    const result = await ResponseModel.updateOne(
      {
        user_id: Types.ObjectId(user_id),
        question_id: Types.ObjectId(question_id),
        exam_id: Types.ObjectId(exam_id),
      },
      { $set: { is_post_reflection_per_question_submitted } },
      { upsert: true } // Create a new response if it doesn't exist
    );

    if (!result) {
      return res.status(404).json({ success: false, message: "Failed to update the response." });
    }

    return res.status(200).json({
      success: true,
      message: "Post reflection status updated successfully.",
      result,
    });
  } catch (error) {
    console.error("Error updating post reflection status:", error);
    return res.status(500).json({ success: false, message: "An error occurred while updating post reflection status." });
  }
};

