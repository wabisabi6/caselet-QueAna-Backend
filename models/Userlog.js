const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userLogSchema = new Schema(
  {
    // behaviour String,
    exam_id: {
      type: mongoose.Types.ObjectId,
    },
    question_id: {
      type: mongoose.Types.ObjectId,
    },
    question_no:  { 
      type: Number, 
      default: null 
    },
    page: { type: String },
    user_id: {
      type: mongoose.Types.ObjectId,
    },
    type: {
      type: String,
      enum: [
        "Search",
        "Click",
        "Submit",
        "Start",
        "Stop",
        "Login",
        "Pre-Reflection",
        "Post-Reflection",
        "Post-Reflection-Per-Question",
        "Confidence",
        "Answer Option",
        "Comment",
        "Answer option",
        "Navigating from",
        "Navigated to",
        "Logout",
        "Final Score",
        "Retake test",
        "Question Score"
      ],
    },
    action: {
      type: String,
    },
    field_name: {},
    field_value: {},
    answer_id: {
      type: mongoose.Types.ObjectId,
    },

    timestamp: {
      type: Date,
    }
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

const UserlogModel = mongoose.model("user_log", userLogSchema);

module.exports = UserlogModel;


//Navigation : From, to with timestamp (User_id, practice_id, )
//Page Activity: User Input, Input field name, input field value