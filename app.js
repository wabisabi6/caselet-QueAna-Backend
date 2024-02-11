var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const connectDB = require("./utils/db");
const dotenv = require("dotenv");
const colors = require("colors");
var http = require("http");
const cors = require('cors');

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const authRouter = require("./routes/auth");
const examRouter = require("./routes/exam");
const questionRouter = require("./routes/question");
const customerRouter = require("./routes/Customer");
const behaviourRouter = require("./routes/Behaviour");
const responseRouter = require("./routes/Response");
const answerRouter = require("./routes/answer");
const userLogRouter = require("./routes/UserLog");
const session = require("express-session");
const MongoStore = require("connect-mongo");
var bodyParser = require("body-parser");
dotenv.config({ path: ".env" });

console.log(process.env.SESSION_SECRET);
var app = express();

connection = connectDB();

// Configure CORS
const corsOptions = {
  origin: 'https://main-deployment-aws-test-admin.d3brix7vti8n8n.amplifyapp.com',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

connection = connectDB();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(bodyParser.json({ limit: "50mb" }));

app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Before the routes
// SESSION ( & COOKIES ) MIDDLEWARE   -- req.session.currentUser
app.use(
  session({
    secret: process.env.SESSION_SECRET,

    // cookie: { maxAge: 3600000 } // 1 hour
    resave: true,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  })
);

app.use("/", indexRouter);
app.use("/service/auth", authRouter);
app.use("/service/exam", examRouter);
app.use("/service/users", usersRouter);
app.use("/service/question", questionRouter);
app.use("/service/customer", customerRouter);
app.use("/service/behaviour", behaviourRouter);
app.use("/service/answer", answerRouter);
app.use("/service/response", responseRouter);
// app.use("/search", searchRouter);
app.use("/service/log", userLogRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  // server.close(() => process.exit(1));
});
// app.listen(process.env.PORT, listener);
// function listener() {
//   setTimeout(() => {
//     const message = `Product Management Server is listening on PORT ${process.env.PORT}`;
//     console.log(message);
//     // global.logger.log("info", message);
//     // global.dbLogger.log({
//     //   level: "info",
//     //   category: "info",
//     //   data: message,
//     // });
//   }, 1000);
// }
var port = normalizePort(process.env.PORT || "3000");
console.log(port);
app.set("port", port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);

module.exports = app;

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}
