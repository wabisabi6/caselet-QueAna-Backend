const { fetchUserIdFromToken } = require("../middleware/auth_validate");
const UserlogModel = require("../models/Userlog");
const LOG_FIELD = ["exam_id", "type", "action", "timestamp", "page"];

exports.fetcLogsOfUser = async (req, res, next) => {
  const search = await UserlogModel.find();
  res.status(200).json({ sucess: true, search });
};

exports.createLog = async (req, res, next) => {
  try {
    console.log("LOG CREATED IS STARTING");

    // 1️⃣ Pull in your body
    const body = { ...req.body };

    // 2️⃣ Derive user_id and attach
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "Missing Authorization header" });
    }
    body.user_id = await fetchUserIdFromToken(token);

    // 3️⃣ Stamp a timestamp
    body.timestamp = Date.now();

    // 4️⃣ Only require that each LOG_FIELD key exists on the object,
    //    not that it’s non-empty
    for (const key of LOG_FIELD) {
      if (!Object.prototype.hasOwnProperty.call(body, key)) {
        return res
          .status(400)
          .json({ success: false, message: `${key} is required` });
      }
    }

    // 5️⃣ Create the log entry
    const entry = await UserlogModel.create(body);
    return res.status(200).json({ success: true, entry });

  } catch (err) {
    console.error("Error in createLog:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
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
    const { exam_id, question_id, question_no, notes, previousNotes, timestamp, page } = req.body;

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
      question_id: question_id,
      question_no: question_no,
      type:        "Comment",               
      action:      "Notes Edited",
      field_name:  "notes",
      field_value: { notes, previousNotes },
      page:        page  || req.path,       
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
