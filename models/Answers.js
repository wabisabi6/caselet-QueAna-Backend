const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const answersSchema = new Schema(
  {
    answer: String,
    option:[String],
    question_id: {
      type: mongoose.Types.ObjectId,
    },
    image: {
      type: String,
    },
    is_correct: {
      type: Boolean,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

const AnswersModel = mongoose.model("answers", answersSchema);

module.exports = AnswersModel;
