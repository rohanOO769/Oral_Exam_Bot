const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const { spawn } = require('child_process');
const { extractText } = require('./pdf'); 
const app = express();
const port = 5000;

app.use(bodyParser.json());

// Set up CORS
app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend's domain
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

// Handle preflight requests for submit-answer route
app.options('/submit-answer', cors());

app.post('/get-random-question', async (req, res) => {
  try {
    const pdfText = await extractText();
    console.log('PDF Text:', pdfText); // Log the extracted PDF text
    
    const pdfQuestions = pdfText.split('\n').filter(question => question.trim() !== '');
    console.log('pdfQuestions:', pdfQuestions); // Log the populated array
    
    const randomIndex = Math.floor(Math.random() * pdfQuestions.length);
    const randomQuestion = pdfQuestions[randomIndex];
    
    console.log('Random question:', randomQuestion);
    
    res.json({ question: randomQuestion });
  } catch (error) {
    console.error('Error fetching random question:', error);
    res.status(500).json({ error: 'Failed to fetch random question' });
  }
});


app.post('/submit-answer', (req, res) => {
  console.log('Received submit-answer request:', req.body); // Log received data

  const userAnswer = req.body.answer;
  const currentQuestion = req.body.currentQuestion;
  const userFollowUpAnswer = req.body.userFollowUpAnswer;

  console.log('User Answer:', userAnswer);
  console.log('Current Question:', currentQuestion);
  console.log('User Follow-Up Answer:', userFollowUpAnswer);

  const pythonScriptPath = '.'; // Set the path to your Python script directory
  // Use spawn to execute the Python script
  const pythonProcess = spawn('python', ['app.py',currentQuestion, userAnswer], {
    cwd: pythonScriptPath,
    shell: true
  });
  
  console.log('Running Python script...');
  let pythonOutput = '';

  // Capture stdout output
  pythonProcess.stdout.on('data', (data) => {
    pythonOutput += data.toString();
    console.log(`Python output1: ${pythonOutput}`);
    console.log(`Python output2: ${data}`);
  });
  // Handle process close
  pythonProcess.on('close', (code) => {
    console.log('Python process exited with code', code);
    
    try {
      const results = JSON.parse(pythonOutput);
      console.log('Python script results:', results);

      const followUpQuestion = results.followUpQuestion;
      const isCorrect = results.isCorrect;
      res.json({ followUpQuestion, isCorrect });
    } catch (error) {
      console.error('Error parsing Python output:', error);
      res.status(500).json({ error: 'Failed to process request' });
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


