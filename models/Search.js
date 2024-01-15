const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SearchSchema = new Schema(
  {
    // Search String,
    exam_id: {
      type: mongoose.Types.ObjectId,
    },
    user_id: {
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

const SearchModel = mongoose.model("Search", SearchSchema);

module.exports = SearchModel;
