var express = require('express');
const {getAllUsers} = require("../controllers/User");
var router = express.Router();

/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

router.get("/get_all_users", getAllUsers);

module.exports = router;
