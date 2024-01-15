const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const responseSchema = new Schema(
  {
    // response String,
    exam_id: {
      type: mongoose.Types.ObjectId,
    },
    question_id: {
      type: mongoose.Types.ObjectId,
    },
    answer_id: {
      type: mongoose.Types.ObjectId,
    },
    user_id: {
      type: mongoose.Types.ObjectId,
    },

    confidence: {
      type: Number,
    },
    comment: {
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

const ResponseModel = mongoose.model("response", responseSchema);

module.exports = ResponseModel;
