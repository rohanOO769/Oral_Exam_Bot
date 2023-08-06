const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios'); // Assuming you have Axios installed

const app = express();
const port = 5000;

app.use(bodyParser.json());

// Initialize your OpenAI API key
const openaiApiKey = 'your-openai-api-key';

// Route to generate initial questions based on PDF content
app.post('/generate-questions', async (req, res) => {
  try {
    const extractedText = req.body.pdfContent;

    // Generate initial question using the OpenAI language model
    const prompt = `Generate questions based on the following text:\n${extractedText}`;
    const response = await axios.post(
      'https://api.openai.com/v1/engines/text-davinci-003/completions',
      {
        prompt: prompt,
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

// Route to handle student responses
app.post('/submit-response', (req, res) => {
  const studentResponse = req.body.response;

  // Process the student's response and generate feedback or follow-up questions
  // Here, you can use the OpenAI API again to generate feedback or follow-up questions
  const feedback = 'Great job! Your answer was clear and accurate.';
  const followUpQuestion = 'Can you provide more details about that topic?';

  res.json({ feedback, followUpQuestion });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
