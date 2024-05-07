const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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
      type: Schema.Types.ObjectId,  
    }
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
