const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: String,
  full_name: String,
  password: String,
  admin: {
    type: Boolean,
    defaut: false,
  },
  email: {
    type: String,
    required: false,
  },
});

const User = mongoose.model("users", userSchema);

module.exports = User;
