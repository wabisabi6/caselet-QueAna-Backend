const jsonwebtoken = require("jsonwebtoken");
const jwt = require("jsonwebtoken");

const checkAuth = (req, res, next) => {
  //fetch current headers

  console.log("Startted");
  if (!req.headers.authorization) {
    console.log("Valud");
    console.log("401 error: No header in request header")
    return res
      .status(401)
      .json({ success: false, message: "Authentication needed." });
    // next();
  }
  console.log("Scs", process.env.SESSION_SECRET);
  let details = req.headers.authorization;
  let token = details.split(" ");
  if (token.length != 2) {
    console.log("401 error: Token length is not equal to 2")
    return res
      .status(401)
      .json({ success: false, message: "Authentication needed." });
  }

  let decodedData = jsonwebtoken.decode(token[1]);

  console.log(decodedData, "Dexcoed data");

  if (decodedData == null) {
    console.log("401 error: Decoded data is null")
    return res
      .status(401)
      .json({ success: false, message: "Authentication needed." });
  }
  if (!decodedData.user_id) {
    console.log("401 error: Decoded Data is not user id")
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
