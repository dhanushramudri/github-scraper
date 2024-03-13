const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { get_all_urls } = require("./your_python_scraping_script"); // Import your Python scraping logic

const app = express();
const port = process.env.PORT || 5000;

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

app.use(bodyParser.json());
app.use(cors());

app.post("/generate_feedback", async (req, res) => {
  try {
    // Replace "https://github.com/SimonHoiberg" with the actual URL or endpoint of your Python scraping script
    const pythonScrapingURL = "https://github.com/SimonHoiberg";
    const { total_urls } = await get_all_urls(pythonScrapingURL);

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `You have scraped ${total_urls.length} URLs. Generate feedback based on the content of these URLs.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let generatedFeedback = await response.text();
    generatedFeedback = generatedFeedback.replace(/\*\*/g, "");
    generatedFeedback = generatedFeedback.split("* ").join("• ");

    res.json({ generatedFeedback });
    console.log("Generated feedback:");
    console.log(generatedFeedback);
  } catch (error) {
    console.error("Error in /generate_feedback route:", error);
    res.status(500).send({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
