const AnswersModel = require("../models/Answers");
const ANSWER_FIELD = ["answer", "question_id"];
const { v4: uuidv4 } = require("uuid");
var base64ToImage = require("base64-to-image");

exports.getAnswers = async (req, res, next) => {
  const Answers = await AnswersModel.find();
  res.status(200).json({ sucess: true, Answers });
};

exports.createAnswers = async (req, res, next) => {
  console.log("Create Answers called in backend")
  let body = req.body;
  keys = Object.keys(body);
  for (let index = 0; index < ANSWER_FIELD.length; index++) {
    const key = ANSWER_FIELD[index];

    //Only for is correct

    body.is_correct = req.body.is_correct ? req.body.is_correct : false;

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

  const answer = await AnswersModel.create(body);
  res.status(200).json({ sucess: true, answer });
};
