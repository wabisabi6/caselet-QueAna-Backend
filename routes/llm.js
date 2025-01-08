const express = require("express");
const bedrockRouter = require("../middleware/bedrock"); // Import the router from bedrock.js

const router = express.Router();

router.use("/", bedrockRouter); // Mount the Bedrock middleware router

module.exports = router;
