const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios'); // Assuming you have Axios installed
const pdf = require('./pdf'); // Import the PDF processing module

const app = express();
const port = 5000;

// Enable CORS to allow requests from your frontend
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000'); // Replace with your frontend's domain
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use(bodyParser.json());

// Initialize your OpenAI API key
const openaiApiKey = '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'; // Replace with your OpenAI API key

// Route to generate initial questions based on PDF content
app.post('/generate-questions', async (req, res) => {
  try {
    // Load PDF contents from the backend
    const pdfContents = await pdf.extractText();

    // Additional prompts to enhance question generation
    const additionalPrompts = [
      'Generate questions based on the following PDF content:',
      pdfContents
    ];

    // Join all prompts
    const combinedPrompt = additionalPrompts.join('\n');

    // Generate initial question using the OpenAI language model
    const response = await axios.post(
      'https://api.openai.com/v1/engines/text-davinci-003/completions',
      {
        prompt: combinedPrompt,
        max_tokens: 50 // Adjust as needed
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`
        }
      }
    );

    const initialQuestion = response.data.choices[0].text.trim();
    res.json({ question: initialQuestion });
  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({ error: 'Failed to generate questions' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
