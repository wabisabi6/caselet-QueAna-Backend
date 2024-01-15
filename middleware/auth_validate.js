const jsonwebtoken = require("jsonwebtoken");
const jwt = require("jsonwebtoken");

const checkAuth = (req, res, next) => {
  //fetch current headers

  console.log("Startted");
  if (!req.headers.authorization) {
    console.log("Valud");
    return res
      .status(401)
      .json({ success: false, message: "Authentication needed." });
    // next();
  }
  console.log("Scs", process.env.SESSION_SECRET);
  let details = req.headers.authorization;
  let token = details.split(" ");
  if (token.length != 2) {
    return res
      .status(401)
      .json({ success: false, message: "Authentication needed." });
  }

  let decodedData = jsonwebtoken.decode(token[1]);

  console.log(decodedData, "Dexcoed data");

  if (decodedData == null) {
    return res
      .status(401)
      .json({ success: false, message: "Authentication needed." });
  }
  if (!decodedData.user_id) {
    return res
      .status(401)
      .json({ success: false, message: "Authentication needed." });
  }
  //retrive the data from token
  next();
};

const fetchUserIdFromToken = (token) => {
  //fetch current headers
  let decodedData = jsonwebtoken.decode(token);
  console.log(decodedData, "His isds");

  return decodedData.user_id;
};
exports.checkAuth = checkAuth;
exports.fetchUserIdFromToken = fetchUserIdFromToken;
