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

// log.controller.js
exports.logRunningNotesEdit = async (req, res) => {
  try {
    // 1️⃣ Extract the JWT and derive the userId
    const token  = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "Missing Authorization token" });
    }
    const userId = await fetchUserIdFromToken(token);

    // 2️⃣ Pull out the client-sent fields
    const { exam_id, notes, previousNotes, deleted, timestamp, page } = req.body;

    // 3️⃣ Validate required fields
    if (!exam_id) {
      return res
        .status(400)
        .json({ success: false, message: "exam_id is required" });
    }

    // 4️⃣ Create the log entry
    const logEntry = await UserlogModel.create({
      user_id:     userId,
      exam_id:     exam_id,
      type:        "Comment",               // or whatever enum you prefer
      action:      "Notes Edited",
      field_name:  { notes, previousNotes },
      field_value: { deleted },
      page:        page  || req.path,       // optional: track which page triggered it
      timestamp:   timestamp || Date.now(),
    });

    // 5️⃣ Return success
    return res.status(200).json({ success: true, logEntry });
  } catch (err) {
    console.error("Error in logRunningNotesEdit:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
