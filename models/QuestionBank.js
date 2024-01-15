const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const qbSchema = new Schema(
  {
    name: String,
    difficulty: String,
    exam_id: mongoose.Types.ObjectId,
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

const QuestionBankModel = mongoose.model("question_bank", qbSchema);

module.exports = QuestionBankModel;
