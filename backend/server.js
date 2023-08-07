const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const pdf = require('./pdf'); // Assuming pdf.js is in the same directory
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 5000;

app.use(bodyParser.json());

// Configure CORS
app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend's domain
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

const openaiApiKey = process.env.OPENAI_API_KEY;

let pdfQuestions = [];

(async () => {
  try {
    const pdfText = await pdf.extractText();
    pdfQuestions = pdfText.split('\n').filter(question => question.trim() !== '');
    // console.log('Loaded', pdfQuestions.length, 'questions from PDF.');
  } catch (error) {
    console.error('Error loading questions from PDF:', error);
  }
})();

app.post('/get-random-question', (req, res) => {
  try {
    const randomIndex = Math.floor(Math.random() * pdfQuestions.length);
    const randomQuestion = pdfQuestions[randomIndex];
    res.json({ question: randomQuestion });
  } catch (error) {
    console.error('Error fetching random question:', error);
    res.status(500).json({ error: 'Failed to fetch random question' });
  }
});

app.post('/submit-answer', async (req, res) => {
  const userAnswer = req.body.answer;

  try {
    const currentQuestion = req.body.currentQuestion;

    // Generate feedback using OpenAI API
    const prompt = `User answer: ${userAnswer}\nExpected answer: ${getExpectedAnswer(currentQuestion)}\nIs the answer correct?`;
    const response = await axios.post(
      'https://api.openai.com/v1/engines/davinci/completions',
      {
        prompt: prompt,
        max_tokens: 100 // Adjust as needed
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`
        }
      }
    );

    const feedback = response.data.choices[0].text.trim();
    const isCorrect = feedback.toLowerCase().includes('yes');

    const followUpQuestion = isCorrect ? 'Great job! Please provide more details.' : 'It seems your answer might need further clarification. Can you elaborate?';

    res.json({ feedback, followUpQuestion, isCorrect });
  } catch (error) {
    console.error('Error generating follow-up question:', error);
    res.status(500).json({ error: 'Failed to generate follow-up question' });
  }
});

// Helper function to get expected answer based on the question
function getExpectedAnswer(question) {
  // Implement your logic here to retrieve or compute the expected answer for the given question
  // For demonstration purposes, returning a hardcoded answer
  return 'Sample expected answer';
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
