const { Types } = require("mongoose");
const { fetchUserIdFromToken } = require("../middleware/auth_validate");
const BehaviourModel = require("../models/Behaviour");
const BEHAVIOUR_FIELDS = ["exam_id", 
  "pre_reflection.familiarity",
  "pre_reflection.frequency",
  "pre_reflection.competence",
  "pre_reflection.skills"];

exports.getUserBehaviour = async (req, res, next) => {
  const userId = await fetchUserIdFromToken(
    req.headers.authorization.split(" ")[1]
  );

  console.log("----User ID Value -----", userId)
  console.log("----Exam ID Value -----", req.query.exam_id)
  let examID = req.query.exam_id;

  //CHECK IF BEHAVIOUR
  const behaviour = await BehaviourModel.find({
    exam_id: examID,
    user_id: userId,
  });

  console.log(examID, userId, "DS");
  if (behaviour.length == 0) {
    return res.status(400).json({
      success: false,
      message: "Reflection Required",
    });
  }
  res.status(200).json({ success: true, behaviour });
};

exports.createBehaviour = async (req, res, next) => {
  let body = req.body;
  const userId = await fetchUserIdFromToken(
    req.headers.authorization.split(" ")[1]
  );
  body.user_id = userId;

  for (let index = 0; index < BEHAVIOUR_FIELDS.length; index++) {
    const key = BEHAVIOUR_FIELDS[index];
    const keyParts = key.split(".");
    let value = body;

    for (let part of keyParts) {
      value = value[part];
      if (value === undefined) break;
    }

    if (value === undefined || value === "") {
      console.log(key);
      return res
        .status(400)
        .json({ success: false, body: `${key} not found, please enter it ` });
    }
  }

  const behavoir = await BehaviourModel.create(body);
  res.status(200).json({ sucess: true, behavoir });
};


exports.updateBehaviour = async (req, res, next) => {
  try {
    // Extract the behaviour_id from the request body
    const { behaviour_id } = req.body;

    console.log("Value of is_task_submitted: ", req.body.is_task_submitted )

    if (!behaviour_id) {
      return res.status(400).json({ success: false, message: "behaviour_id is required" });
    }

    // Prepare the fields to update from the request body
    const updateFields = {
      post_reflection_difficulty: req.body.post_reflection_difficulty,
      post_reflection_interest: req.body.post_reflection_interest,
      post_reflection_helpfulness: req.body.post_reflection_helpfulness,
      is_task_submitted: req.body.is_task_submitted,
      is_post_reflection_submitted: req.body.is_post_reflection_submitted,  // New field for post-reflection submission
    
    };

    // Remove undefined fields (if any field is not provided in the body)
    Object.keys(updateFields).forEach((key) => {
      if (updateFields[key] === undefined) {
        delete updateFields[key];
      }
    });

    // Update behaviour document based on behaviour_id
    const updatedBehaviour = await BehaviourModel.updateOne(
      { _id: Types.ObjectId(behaviour_id) },  // Match by behaviour_id
      { $set: updateFields }  // Set the fields that need updating
    );

    console.log("Update Fields: ", updateFields);  // Check if is_task_submitted is present here
    console.log("Updated Behaviour Result:", updatedBehaviour);


    // Check if any document was modified
    if (updatedBehaviour.nModified > 0) {
      const updatedBehaviourData = await BehaviourModel.findById(behaviour_id);
      return res.status(200).json({
        success: true,
        message: "Behaviour updated successfully",
        updatedBehaviour: updatedBehaviourData
      });
    } else {
      return res.status(400).json({ success: false, message: "No behaviour found or updated" });
    }
  } catch (error) {
    console.error("Error updating behaviour: ", error);
    return res.status(500).json({ success: false, message: "Server error", error });
  }
};


// Delete all behaviour entries for a user based on exam_id and user_id
exports.deleteUserBehaviour = async (req, res, next) => {
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

    // Delete Behaviour entries for the user and exam
    await BehaviourModel.deleteMany({
      exam_id: Types.ObjectId(examId),
      user_id: Types.ObjectId(userId),
    });

    return res.status(200).json({
      success: true,
      message: "User behaviour deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user behaviour:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error,
    });
  }
};
