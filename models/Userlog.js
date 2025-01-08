const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userLogSchema = new Schema(
  {
    exam_id: {
      type: mongoose.Types.ObjectId,
    },
    question_id: {
      type: mongoose.Types.ObjectId,
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
        "Question Score",
        "LLM-Search", // Ensure this is included
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
    },
    llm_query: {
      type: String, // To store the user's query sent to the LLM
      default: null,
    },
    llm_response: {
      type: String, // To store the LLM's response
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

// Use mongoose.models to avoid OverwriteModelError
const UserlogModel =
  mongoose.models.user_log || mongoose.model("user_log", userLogSchema);

module.exports = UserlogModel;
