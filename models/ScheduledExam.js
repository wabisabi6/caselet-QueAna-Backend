const mongoose = require("mongoose");
const Schema = mongoose.Schema;
require('./Exams');

const scheduledExamSchema = new Schema(
  {
    name: String,
    start_time: {
      type: Date,
    },
    end_time: {
      type: Date,
    },
    selectedExamId: {
      type: mongoose.Types.ObjectId,
      ref: "exam"  // Reference the Exam model
    },
    require_post_reflection: { 
      type: Boolean, 
      default: false 
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

const ScheduledExamModel = mongoose.model("scheduledExam", scheduledExamSchema);

module.exports = ScheduledExamModel;
