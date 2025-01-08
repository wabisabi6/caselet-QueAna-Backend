const express = require("express");
const bodyParser = require("body-parser");
const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");
const UserlogModel = require("../models/userlog"); // Adjust the path as needed

// Initialize Express Router
const router = express.Router();

// Middleware to parse JSON request bodies
router.use(bodyParser.json());

// AWS Bedrock Runtime Client Setup
const bedrockClient = new BedrockRuntimeClient({
  region: "us-east-2", // Replace with your AWS region
});

// Chat with Bedrock Model Endpoint
router.post("/interact", async (req, res) => {
  const inferenceProfileArn = "arn:aws:bedrock:us-east-2:992382724910:inference-profile/us.meta.llama3-2-3b-instruct-v1:0"; // Replace with your actual ARN
  const { inputText, userId } = req.body; // Assuming `userId` is passed in the request body

  if (!inputText) {
    return res.status(400).json({
      success: false,
      error: "The `inputText` field is required.",
    });
  }

  try {
    // Construct the prompt
    const prompt = `You are a helpful assistant. Answer the question below concisely and clearly without providing unnecessary details.

Question: ${inputText}

Answer:`;

    // Create the request payload
    const requestPayload = {
      prompt,
      temperature: 0.5,  // Lower temperature for deterministic responses
      top_p: 0.9,        // Nucleus sampling for creativity control
      max_gen_len: 1024, // Limit the response length
    };

    // Create the parameters for the Bedrock API
    const params = {
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(requestPayload),
      modelId: inferenceProfileArn, // Use the Inference Profile ARN
    };

    // Invoke the model using Bedrock
    const command = new InvokeModelCommand(params);
    const response = await bedrockClient.send(command);

    // Decode the response
    const jsonString = new TextDecoder().decode(response.body);
    const modelResponse = JSON.parse(jsonString);
    const generatedText = modelResponse.generation?.trim();

    // Log the interaction in the database
    await UserlogModel.create({
      user_id: userId,                 // Log the user ID
      type: "LLM-Search",             // Indicate the type of log
      action: `query=${inputText}`,    // Log the user's query
      llm_query: inputText || null,          // Ensure InputText is passed here
      llm_response: generatedText || null,    // LLM's response
      timestamp: new Date(),          // Current timestamp
    });

    // Format and send the response
    res.status(200).json({
      success: true,
      prompt: prompt,
      completion: generatedText,
    });
  } catch (error) {
    console.error("Error communicating with Bedrock:", error.message);

    // Log the error interaction in the database
    await UserlogModel.create({
      user_id: req.body.userId || null, // Log user ID if available
      type: "LLM-Search",              // Indicate the type of log
      user_query: inputText || null,   // User's query (if available)
      llm_response: "Error occurred",  // Log the error
      timestamp: new Date(),           // Current timestamp
    });

    res.status(500).json({
      success: false,
      error: error.message || "An error occurred while communicating with Bedrock.",
    });
  }
});

module.exports = router;
