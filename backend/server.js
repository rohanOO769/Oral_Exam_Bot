// server.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const { extractText } = require('./pdf');
const { verifyAnswer, generateFollowUpQuestion } = require('./questions.js'); // Import the questions.jsx module
require('dotenv').config();
const { AbortController } = require('abort-controller');
const controller = new AbortController();

const app = express();
const port = 5000;
// const url = "https://backend-5f1p.onrender.com";
app.use(bodyParser.json());

app.use(cors({
  origin: 'https://frontend-8vo3.onrender.com', // Replace with your frontend's domain
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

// Replace <password> with your actual MongoDB Atlas password
const uri = process.env.MONGO_CLIENT;

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

// Endpoint to get follow-up questions
app.post('/get-follow-up-question', (req, res) => {
  try {
    const dataRes = req.body;
    console.log("at /get-follow-up-question endpoint: ",dataRes);
    console.log(dataRes.question);
    res.json({ follow_up_question: dataRes.question });

  } catch (error) {
    console.error('Error fetching followup question:', error);
    res.status(500).json({ error: 'Failed to fetch followup question' });
  }
});

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

app.options('/submit-answer', cors());

app.post('/submit-answer', async (req, res) => {
  try {
    const userAnswer = req.body.answer;
    const currentQuestion = req.body.currentQuestion;
    console.log("Current Question: ", currentQuestion);
    console.log("User Answer: ", userAnswer);

    if (!userAnswer || !currentQuestion) {
      return res.status(400).json({ error: 'Both question and answer are required' });
    }

    const db = client.db('question_feedback');
    const collection = db.collection('userResponses');
    const latestFeedback = await collection.findOne({}, { sort: { _id: -1 } });

    let verifyAnswerIdCounter;

    if (latestFeedback === null) {
      verifyAnswerIdCounter = 1;
    } else {
      verifyAnswerIdCounter = latestFeedback._id + 1;
    }

    const result = await collection.insertOne({
      _id: verifyAnswerIdCounter,
      answer: userAnswer,
      question: currentQuestion,
      timestamp: new Date()
    });

    console.log('Data inserted into MongoDB:', result);

    // Call the verifyAnswer function to execute the verification logic
    try {
      const Data = await verifyAnswer(currentQuestion, userAnswer);
      console.log("Feedback data: ", Data);
      console.log(Data.is_correct);
      if (Data.is_correct) {
        
        try {
          const followUpData = await generateFollowUpQuestion(currentQuestion, userAnswer);
          console.log("Follow Up data at backend: ", followUpData);
          console.log(followUpData.follow_up_question);
      
          // Send the follow-up question as a response
          res.json({ feedback: Data.feedback+"\n"+Data.interviewer, follow_up_question: followUpData.follow_up_question });
        } catch (error) {
          console.error('Error generating follow-up question:', error);
          res.status(500).json({ error: 'Failed to generate follow-up question' });
        }
    } else {
      // Respond to the client with feedback (for incorrect answers) and no follow-up question
      res.json({ feedback: Data.feedback, follow_up_question: null });
    }

      // Take further actions based on the verification result if needed
      console.log('Exited verification process');
    } catch (error) {
      console.error('Error running verification:', error);
      res.status(500).json({ error: 'Verification process failed' });
    }
  } catch (error) {
    console.error('Error inserting data into MongoDB:', error);
    res.status(500).json({ error: 'Failed to insert data' });
    // Close the connection
    client.close();
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
