const { fetchUserIdFromToken } = require("../middleware/auth_validate");
const UserlogModel = require("../models/Userlog");
const LOG_FIELD = ["exam_id", "type", "action", "timestamp", "page"];

exports.fetcLogsOfUser = async (req, res, next) => {
  const search = await UserlogModel.find();
  res.status(200).json({ sucess: true, search });
};

exports.createLog = async (req, res, next) => {
  console.log("LOG CREATED IS STARTING");
  let body = req.body;
  const userId = await fetchUserIdFromToken(
    req.headers.authorization.split(" ")[1]
  );
  body.user_id = userId;

  body.timestamp = Date.now();
  keys = Object.keys(body);
  console.log(keys, "This is dflka");
  for (let index = 0; index < LOG_FIELD.length; index++) {
    const key = LOG_FIELD[index];

    if (!keys.includes(key) || !body[key]) {
      return res
        .status(400)
        .json({ sucess: false, body: `${key} not found, please enter it ` });
    }
  }
  const search = await UserlogModel.create(body);
  res.status(200).json({ sucess: true, search });
};
