var express = require("express");
const nuakariController = require("../controllers/naukari/naukariController");
var router = express.Router();

/* GET home page. */
router.get("/", nuakariController);

module.exports = router;
