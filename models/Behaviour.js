const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const behaviourSchema = new Schema(
  {
    // behaviour String,
    exam_id: {
      type: mongoose.Types.ObjectId,
    },
    user_id: {
      type: mongoose.Types.ObjectId,
    },
    pre_reflection: {
      familiarity: {
        type: String,
        default: "",
      },
      frequency: {
        type: String,
        default: "",
      },
      competence: {
        type: String,
        default: "",
      },
      skills: {
        type: String,
        default: "",
      }
    },
    post_reflection_difficulty: {
      type: String,
      default: "",
    },
    post_reflection_interest: {
      type: String,
      default: "",
    },
    post_reflection_helpfulness: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

const BehaviourModel = mongoose.model("behaviour", behaviourSchema);

module.exports = BehaviourModel;
