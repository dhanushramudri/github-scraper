const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = process.env.PORT || 5000;

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

app.use(bodyParser.json());
app.use(cors());

// Endpoint to fetch a random question from the Google Generative AI API
app.get("/question", async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const jobDescription = req.query.jobDescription || "backend"; // Default to "frontend" if not provided

    const prompt = `You are the interviewer for a position at a company. You are interviewing a candidate who applies for the following job description: ${jobDescription}. Generate an array of 1 question to ask the candidate. The question should be open-ended and should help you understand the candidate's experience, skills, and problem-solving abilities. The question should also assess how the candidate would fit into the company's culture.`;

    // Retry mechanism with a simple loop
    let retries = 0;
    let question;
    while (retries < 3) {
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        question = await response.text();
        break; // Break the loop if successful
      } catch (error) {
        console.error("Error generating content:", error);
        retries++;
      }
    }

    if (question) {
      res.send({ question });
      console.log(question);
    } else {
      throw new Error("Failed to fetch question after multiple attempts");
    }
  } catch (error) {
    console.error("Error in /question route:", error);
    res.status(500).send({ error: error.message });
  }
});

// Function to analyze the user's response and provide formatted feedback
const analyzeUserResponse = async (userAnswer, question) => {
  try {
    // Constructing the prompt for generating feedback
    const prompt = `Now, give me feedback based on the user's answer: "${userAnswer}" to the question: "${question}". Provide effective feedback in 5 concise lines.`;

    // Call the Google Generative AI to get feedback
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const feedback = await response.text();

    // Return the generated feedback

    console.log("Generated feedback");
    console.log(feedback);
    return feedback;
  } catch (error) {
    console.error("Error in analyzeUserResponse:", error);
    throw new Error("Failed to generate feedback");
  }
};

// Function to determine the best feedback methods based on skill ratings
const getBestFeedbackMethods = (skillRatings) => {
  const bestMethods = [];

  for (const skill in skillRatings) {
    if (skillRatings[skill] >= 50) {
      bestMethods.push(`- Positive reinforcement for ${skill}`);
    } else {
      bestMethods.push(`- Encourage improvement in ${skill}`);
    }
  }

  return bestMethods;
};

// // Endpoint to generate feedback based on the user's answer
// app.post("/generate", async (req, res) => {
//   try {
//     const { prompt } = req.body;

//     const model = genAI.getGenerativeModel({ model: "gemini-pro" });
//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     const userAnswer = await response.text();

//     // Analyze the user's response and generate detailed feedback
//     const detailedFeedback = analyzeUserResponse(userAnswer);

//     // Assuming analyzeUserResponse returns an array of feedback items
//     res.send({ generatedFeedback: detailedFeedback });
//   } catch (error) {
//     console.error("Error in /generate route:", error);
//     res.status(500).send({ error: error.message });
//   }
// });
app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let userAnswer = await response.text();
    userAnswer = userAnswer.replace(/\*\*/g, "");

    // You can directly use the Gemini response as feedback
    userAnswer = userAnswer.split("* ").join("• ");

    res.json({ generatedFeedback: userAnswer });
    console.log("useranswer");
    console.log(userAnswer);
  } catch (error) {
    console.error("Error in /generate route:", error);
    res.status(500).send({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
