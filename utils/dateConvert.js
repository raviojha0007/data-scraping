const moment = require("moment");
exports.dateConvert = function () {
  const now = moment.utc();
  const timestamp = now.subtract(200, "days").valueOf(); 

  return timestamp;
};
