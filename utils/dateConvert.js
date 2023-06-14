const moment = require("moment");
exports.dateConvert = function () {
  const now = moment.utc();
  const timestamp = now.subtract(59, "minutes").valueOf(); 

  return timestamp;
};
