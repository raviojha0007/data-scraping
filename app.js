const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cron = require("node-cron");
const naukariController = require("./controllers/naukari/naukariController");
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const {
  linkidInController,
} = require("./controllers/linkedIn/linkedInControllers");

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

// https://www.upwork.com/search/jobs/url?q=salesforce&sort=recency&per_page=10

// cron job

// cron.schedule("* 30 * * *", () => {
//   naukariController();
//   linkidInController();
// });
//linkidInController();
linkidInController();


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

module.exports = app;
