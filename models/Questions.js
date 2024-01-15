const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const questionSchema = new Schema(
  {
    question: String,
    exam_id: {
      type: mongoose.Types.ObjectId,
    },

    question_no: {
      type: Number,
    },
    image: {
      type: String,
    },
    explain: {
      type: String,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

const QuestionsModel = mongoose.model("questions", questionSchema);

module.exports = QuestionsModel;
