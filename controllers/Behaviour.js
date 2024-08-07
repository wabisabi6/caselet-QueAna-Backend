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
  console.log(req.body.behavour_id);
  const Behaviour = await BehaviourModel.updateOne(
    { _id: Types.ObjectId(req.body.behavour_id) },
    { $set: { post_reflection_difficulty: req.body.post_reflection_difficulty,
              post_reflection_interest: req.body.post_reflection_interest,
              post_reflection_helpfulness: req.body.post_reflection_helpfulness,
     } }
  );

  console.log(req.body, Behaviour);
  res.status(200).json({ sucess: true, Behaviour });
};