const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const examSchema = new Schema(
  {
    name: String,
    duration: {
      type: Number,
    },
    difficulty: {
      type: String,
    },
    total_questions: {
      type: Number,
    },
    problem_context: {
      type: String,
    },
    data_summary: {
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

const ExamModel = mongoose.model("exam", examSchema);

module.exports = ExamModel;
