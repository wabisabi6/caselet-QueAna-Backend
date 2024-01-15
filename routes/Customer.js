var express = require("express");
const { getCustomer, createCustomer } = require("../controllers/customer");

var router = express.Router();

// Not needed
// POST '/auth/signup'
// router.get("/list", getCustomer);
// router.post("/create", createCustomer);
module.exports = router;
