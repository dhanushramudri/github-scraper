const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { spawn } = require("child_process");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

app.use(bodyParser.json());
app.use(cors());
const role = "frontend Developer (fresher)"; // Fixed typo in "fontend" to "frontend"

// Function to run the Python script and return the scraped URLs
const runPythonScript = (pythonScript, args) => {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn("python", [pythonScript, ...args]);

    let output = "";

    pythonProcess.stdout.on("data", (data) => {
      output += data.toString();
    });

    pythonProcess.on("close", (code) => {
      if (code === 0) {
        resolve(output.trim());
      } else {
        reject(`Python script exited with code ${code}`);
      }
    });

    pythonProcess.on("error", (err) => {
      reject(`Failed to run Python script: ${err}`);
    });
  });
};

// Run the Python script to get the scraped URLs
const pythonScrapingURL = "https://github.com/SimonHoiberg";
runPythonScript("./tester.py", [pythonScrapingURL]).then((total_urls) => {
  console.log(`Scraped URLs: ${total_urls}`);

  // Use the obtained scraped URLs
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const prompt = `You have scraped ${total_urls} URLs. Imagine you as an ATS system. Say whether the user is suitable for the ${role} role or not, based on the repository names, imagine the tech stack they used. Generate feedback based on the content of these URLs. Finally, give me an emoji that is selected or not.`;

  // Placeholder logic for generating feedback
  model
    .generateContent(prompt)
    .then((result) => {
      // Access the text property directly, or execute if it's a function
      const responseText = result.response.text;

      if (typeof responseText === "function") {
        // If responseText is a function, invoke it to get the actual text
        const generatedFeedback = responseText();

        // Structure the output with headers and new lines
        const formattedOutput = `
          Generated Feedback:
          --------------------
          ${generatedFeedback}
        `;

        console.log(formattedOutput);

        // Send the formattedOutput to the root ("/") page
        app.get("/", (req, res) => {
          res.send(formattedOutput);
        });
      } else {
        // If responseText is not a function, it should be the actual text
        // Structure the output with headers and new lines
        const formattedOutput = `
          Generated Feedback:
          --------------------
          ${responseText}
        `;

        console.log(formattedOutput);

        // Send the formattedOutput to the root ("/") page
        app.get("/", (req, res) => {
          res.send(formattedOutput);
        });
      }

      app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
      });
    })
    .catch((error) => {
      console.error(`Error running Python script: ${error}`);
    });
});
