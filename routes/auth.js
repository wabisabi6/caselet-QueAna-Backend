var express = require("express");

var router = express.Router();

const {
  resetPasswordController,
  signUpController,
  loginController,
  getUserInfo,
  updatePracticeId,
  getPracticeIdController,
} = require("../controllers/aunthentication");
const { checkAuth } = require("../middleware/auth_validate");
router.post("/signup", signUpController);
router.post("/login", loginController);
router.post("/reset-password", resetPasswordController);
router.get("/user_info", checkAuth, getUserInfo);
router.get("/getPracticeId", getPracticeIdController);
router.post("/updatePracticeId", updatePracticeId);
router.get("/logout", (req, res, next) => {
  req.session.destroy((err) => {
    res.redirect("/login");
  });
});

module.exports = router;
