var express = require("express");
const User = require("./../models/User");
var router = express.Router();
const ErrorResponse = require("../utils/ErrorResponse");
const jwt = require("jsonwebtoken");

// 0 - Require bcrypt
const bcrypt = require("bcrypt");
// 1 - Specify how many salt rounds
const saltRounds = 10;

// POST '/auth/signup'
exports.signUpController = (req, res, next) => {
  // 2 - Destructure the password and username
  console.log("Request Body Content:", req.body);
  const { username, password, full_name } = req.body;

  if (username == undefined) {
    return res.status(200).json({ success: false });
  }

  // 3 - Check if the username and password are empty strings
  if (username === "" || password === "" || full_name == "") {
    return res.status(401).json({
      success: false,
      errorMessage: "Username and password not found!",
    });
    return;
  }
  console.log("asdsajdlk");

  // 4 - Check if the username already exists - if so send error

  User.findOne({ username })
    .then((user) => {
      // > If username exists already send the error
      if (user) {
        res.status(401).json({
          successMessage: false,
          errorMessage: "Username already exists.",
        });
        return;
      }

      // > If username doesn't exist, generate salts and hash the password
      console.log("BUG BELOW HERE");
      const salt = bcrypt.genSaltSync(saltRounds);
      const hashedPassword = bcrypt.hashSync(password, salt);

      // > Create the user in the DB

      User.create({ username, password: hashedPassword, full_name })
        .then((newUserObj) => {
          let jwtSecretKey = process.env.SESSION_SECRET;
          let data = {
            user_id: newUserObj._id,
            email: newUserObj.username,
            full_name: newUserObj.full_name,
            username: newUserObj.username,
            date: new Date(),
          };

          console.log("INsdsadsklj");
          const token = jwt.sign(data, jwtSecretKey);
          // save user token

          res.json({ succes: true, token: token});
        })
        .catch((err) => {
          console.log(err);
          res.json({
            successMessage: false,
            errorMessage: err,
          });
        });

      // > Once the user is created , redirect to home
    })
    .catch((err) => console.log(err));
};

exports.getUserInfo = async (req, res, next) => {
  const user = await User.find({ _id: req.query.user_id });
  if (user.length == 0) {
    return res.status(401).json({ success: false });
  }

  return res.status(200).json({ success: true, user: user[0] });
};
// POST 'auth/login'
exports.loginController = async (req, res, next) => {
  // Deconstruct the password and the user
  const { username, password: enteredPassword } = req.body;

  // Check if username or password are empty strings
  if (username === "" || enteredPassword === "") {
    return res.status(401).json({
      success: false,
      errorMessage: "Username and password not found!",
    });
    return;
  }

  console.log("The  APple");
  // Find the user by username

  console.log("username", username);
  const user_list = await User.find({ username: username });

  if (user_list.length == 0) {
    return res.status(401).json({
      success: false,
      errorMessage: "Username and password combination invalid!",
    });
  }

  let userData = user_list[0];

  const hashedPasswordFromDB = userData.password; // Hashed password saved in DB during signup

  const passwordCorrect = bcrypt.compareSync(
    enteredPassword,
    hashedPasswordFromDB
  );
  // If password is correct - create session (& cookie) and redirect
  if (passwordCorrect) {
    // Save the login in the session ( and create cookie )
    // And redirect the user

    let jwtSecretKey = process.env.SESSION_SECRET;
    let data = {
      user_id: userData._id,
      email: userData.username,
      full_name: userData.full_name,
      username: userData.username,
      date: new Date(),
    };

    const token = jwt.sign(data, jwtSecretKey);
    // save user token

    return res.json({ success: true, token: token, username: data.username, 
                      full_name: data.full_name, user_id: data.user_id });
  } else {
    return res.status(401).json({
      success: false,
      errorMessage: "Username and password does not match!",
    });
  }
};

//Check if user is logged in
exports.protected = (req, res, next) => {
  if (req.session.currentUser) {
    next();
  } else {
    res.render("login", {
      errorMessage: "Login required. Please login",
      successMessage: false,
    });
  }
};
