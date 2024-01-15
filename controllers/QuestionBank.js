const QuestionBankModel = require("../models/QuestionBank");

exports.getQuestionBank = async (req, res, next) => {
  const question_bank = await QuestionBankModel.find();
  res.status(200).json({ sucess: true, question_bank });
};

exports.createQuestionBank = async (req, res, next) => {
  let body = req.body;

  const question_bank = await QuestionBankModel.create(body);
  res.status(200).json({ sucess: true, question_bank });
};
