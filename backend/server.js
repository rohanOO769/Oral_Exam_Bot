// server.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const { extractText } = require('./pdf');
const { spawn } = require('child_process');
const fetch = require('node-fetch');

require('dotenv').config();

const app = express();
const port = 5000;
const url = "https://backend-5f1p.onrender.com/";
app.use(bodyParser.json());

app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend's domain
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

async function fetchFollowUpQuestionAndFeedbackFromDatabase() {
  try {
    const db = client.db('question_feedback');
    const collection = db.collection('followUp');

    // Fetch the latest user-specific follow-up question
    const latestResponse = await collection.findOne({}, { sort: { _id: -1 } });

    if (latestResponse) {
      // Extract the follow-up question and feedback from the response
      const followUpQuestion = latestResponse.follow_up_question || '';
      const InterviewerFeedback = latestResponse.feedback || '';

      // Create a JSON object containing both values
      const responseJson = {
        follow_up_question: followUpQuestion,
        feedback: InterviewerFeedback,
      };

      return responseJson;
    }

    // If there's no valid follow-up question or latestResponse is null, return an empty JSON object
    return {};
  } catch (error) {
    console.error('Error fetching follow-up question and feedback:', error);
    throw new Error('Failed to fetch follow-up question and feedback');
  }
}



app.post('/get-follow-up-question', async (req, res) => {
  try {
    const response = await fetchFollowUpQuestionAndFeedbackFromDatabase();
    if (response !== '') {
      if (response.follow_up_question !== undefined) {
        console.log('Follow-Up Question:', response.follow_up_question);
      } else {
        console.log('No Follow-Up Question found.');
      }

      if (response.feedback !== undefined) {
        console.log("Interviewer's Response:", response.feedback);
      } else {
        console.log("No Interviewer's Response found.");
      }
      // Send the follow-up question data to the frontend
      res.json({ follow_up_question: response.follow_up_question, feedback: response.feedback });
    } else {
      console.log('No data found in the Follow-up database.');
    }
    
    
  } catch (error) {
    console.error('Error fetching follow-up question:', error);
    res.status(500).json({ error: 'Failed to fetch follow-up question' });
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
    var userAnswer = req.body.answer;
    var currentQuestion = req.body.currentQuestion;
    console.log("Current Question: ",currentQuestion);
    console.log("User Answer: ",userAnswer);

    const db = client.db('question_feedback'); // Replace with your database name
    const collection = db.collection('userResponses'); // Replace with your collection name
    const latestFeedback = await collection.findOne({}, { sort: { _id: -1 } });

    let verifyAnswerIdCounter;

    if (latestFeedback === null) {
      verifyAnswerIdCounter = 1; // Set a default value if no documents are found
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

    // Execute the Python script
    const pythonScriptPath = '.'; // Set the path to your Python script directory
    const pythonProcess = spawn('python', ['application.py', currentQuestion, userAnswer], {
      cwd: pythonScriptPath,
      shell: true
    });

    console.log('Running Python script...');
    let pythonOutput = '';

    // Capture stdout output
    pythonProcess.stdout.on('data', (data) => {
      pythonOutput += data.toString();
      // console.log(`Python output:\n ${data}`);
      // Check if the output contains the pretty_feedback
      if (data.includes('pretty_feedback')) {
        const prettyFeedback = data.match(/pretty_feedback:\s*(.*)/)[1];
        console.log('Pretty Feedback:', prettyFeedback);
      }
    });

    pythonProcess.on('close', async (code) => {
      console.log('Python process exited with code', code);
      console.log('Full Python output: ', pythonOutput);

      // // Fetch the follow-up question after the Python script completes
      // try {
      //   const response = await fetchFollowUpQuestionFromDatabase();

      //   if (response !== '') {
      //     if (response.follow_up_question !== undefined) {
      //       console.log('Follow-Up Question:', response.follow_up_question);
      //     } else {
      //       console.log('No Follow-Up Question found.');
      //     }

      //     if (response.Interviewer !== undefined) {
      //       console.log("Interviewer's Response:", response.Interviewer);
      //     } else {
      //       console.log("No Interviewer's Response found.");
      //     }
      //   } else {
      //     console.log('No data found in the Follow-up database.');
      //   }
      // } catch (error) {
      //   console.error('Error fetching follow-up question:', error);
      // }

      

      // Call the /get-follow-up-question endpoint after the Python script completes
      try {
        const response = await fetch(url+'/get-follow-up-question', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({}) // Add any required data in the body if needed
        });

        const data = await response.json();
        console.log("Follow-Up Question Data:", data);
        // Here, you can take further actions related to the follow-up question data if needed.
      } catch (error) {
        console.error('Error calling /get-follow-up-question:', error);
      }

      res.json({ success: true });
      console.log("Exited Python");
    });

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
