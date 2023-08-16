//server.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const { extractText } = require('./pdf');
const { spawn } = require('child_process');

const app = express();
const port = 5000;

app.use(bodyParser.json());

app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend's domain
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

app.options('/submit-answer', cors());

// Replace <password> with your actual MongoDB Atlas password
const uri = "mongodb+srv://aminrohan54:admin@python.jdnsost.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connectToMongoDB() {
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');
  } catch (error) {
    console.error('Error connecting to MongoDB Atlas:', error);
  }
}

connectToMongoDB();

app.post('/get-random-question', async (req, res) => {
  try {
    const pdfText = await extractText();
    const pdfQuestions = pdfText.split('\n').filter(question => question.trim() !== '');
    const formattedQuestions = pdfQuestions.map(question => question.replace(/^\d+\.\s*/, ''));

    const randomIndex = Math.floor(Math.random() * formattedQuestions.length);
    const randomQuestion = formattedQuestions[randomIndex];

    console.log('Random question:', randomQuestion);

    res.json({ question: randomQuestion });
  } catch (error) {
    console.error('Error fetching random question:', error);
    res.status(500).json({ error: 'Failed to fetch random question' });
  }
});

app.post('/submit-answer', async (req, res) => {
  try {
    const userAnswer = req.body.answer;
    const currentQuestion = req.body.currentQuestion;
    const userFollowUpAnswer = req.body.userFollowUpAnswer;

    const db = client.db('question_feedback'); // Replace with your database name
    const collection = db.collection('userResponses'); // Replace with your collection name

    const result = await collection.insertOne({
      answer: userAnswer,
      question: currentQuestion,
      followUpAnswer: userFollowUpAnswer,
      timestamp: new Date()
    });

    console.log('Data inserted into MongoDB:', result);

    // Execute the Python script
    const pythonScriptPath = '.'; // Set the path to your Python script directory
    const pythonProcess = spawn('python', ['new_app.py', currentQuestion, userAnswer], {
      cwd: pythonScriptPath,
      shell: true
    });

    console.log('Running Python script...');
    let pythonOutput = '';

    // Capture stdout output
    pythonProcess.stdout.on('data', (data) => {
      pythonOutput += data.toString();
      console.log(`Python output:\n ${data}`);
      // Check if the output contains the pretty_feedback
      if (data.includes('pretty_feedback')) {
        const prettyFeedback = data.match(/pretty_feedback:\s*(.*)/)[1];
        console.log('Pretty Feedback:', prettyFeedback);
      }
    });

    // Handle process close
    pythonProcess.on('close', (code) => {
      console.log('Python process exited with code', code);
      console.log('Full Python output:', pythonOutput);
      // You can parse and send the Python output to the client here if needed
      res.json({ success: true });
    });

  } catch (error) {
    console.error('Error inserting data into MongoDB:', error);
    res.status(500).json({ error: 'Failed to insert data' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

process.on('SIGINT', () => {
  client.close().then(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});
