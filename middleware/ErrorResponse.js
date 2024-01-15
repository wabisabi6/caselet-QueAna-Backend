function errResponse(res, message) {
  console.log("This is errro");
  return res.status(400, message);
}
exports.errResponse = errResponse;
