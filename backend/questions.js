// questions.js

const { OpenAI } = require('openai');
const { MongoClient, ServerApiVersion } = require('mongodb');
const { ServerApi } = require('mongodb');
const fetch = require('node-fetch');

require('dotenv').config();

// Set your OpenAI API key
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) ;

// MongoDB URI
const uri = process.env.MONGO_CLIENT;

// Create a new client and connect to the server
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

const uncertaintyWords = ["don't know", "not sure", "no idea", "uncertain", "confused", "blank", "lost"];

async function verifyAnswer(question, userAnswer) {
  try {
    const db = client.db('question_feedback');
    const feedbackCollection = db.collection('feedback');

    const latestFeedback = await feedbackCollection.findOne({}, { sort: { _id: -1 } });

    let verifyAnswerIdCounter;

    if (latestFeedback === null) {
      verifyAnswerIdCounter = 1; // Set a default value if no documents are found
    } else {
      verifyAnswerIdCounter = latestFeedback._id + 1;
    }

    console.log("Verifying answer...");

    const messages = [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: `Question: ${question}\nUser answer: ${userAnswer}` },
      { role: 'user', content: 'Is the answer correct?(reply in a single word(yes or no))' },
    ];
  
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Use GPT-3.5 Turbo for faster responses
      messages: messages,
    });

    let feedbackData = {};
    const feedbackContent = response.choices[0].message.content;
    if (feedbackContent !== undefined && feedbackContent !== null) {
      const feedback = feedbackContent.toLowerCase();
      console.log(feedback);

      if (feedback.includes("yes") || feedback.includes("correct") || feedback.includes("accurate")) {
        await new Promise(resolve => setTimeout(resolve, 20000));
  
        const messages = [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: `Question: ${question}\nUser answer: ${userAnswer}\nSpeak about it (within 100 words)` },
        ];
  
        const response2 = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo', // Use GPT-3.5 Turbo for faster responses
          messages: messages,
        });
  
        const feedback2 = response2.choices[0].message.content.toLowerCase();
        feedbackData = {
          _id: verifyAnswerIdCounter,
          question: question,
          user_answer: userAnswer,
          is_correct: true,
          feedback: "Correct answer! Well done!",
          interviewer: feedback2
        };
      } else if (feedback === "no") {
          if (uncertaintyWords.some(keyword => userAnswer.toLowerCase().includes(keyword.toLowerCase().trim()))) {
            feedbackData = {
              _id: verifyAnswerIdCounter,
              question: question,
              user_answer: userAnswer,
              is_correct: false,
              feedback: "That's okay! Mistakes happen. Remember, every attempt is a step towards learning.",
            };
          } else {
            feedbackData = {
              _id: verifyAnswerIdCounter,
              question: question,
              user_answer: userAnswer,
              is_correct: false,
              feedback: "It seems your answer needs clarification. Could you elaborate?",
            };
        }
      } else {
        feedbackData = {
          _id: verifyAnswerIdCounter,
          question: question,
          user_answer: userAnswer,
          is_correct: false,
          feedback: "Sorry. Can you repeat?",
        };
      }
    } else {
      // Handle the case where feedbackContent is undefined or null.
      console.error('Feedback content is undefined or null');
      // You can throw an error or return an appropriate response here.
    }  

    await feedbackCollection.insertOne(feedbackData);
    const prettyFeedback = JSON.stringify(feedbackData, null, 4);
    console.log(prettyFeedback);
    console.log("API Response:", response);
    return feedbackData;
  } catch (error) {
    console.error('Error verifying answer:', error);
    throw new Error('Failed to verify answer');
  }
}


async function generateFollowUpQuestion(previousQuestion, userAnswer) {
  try {
    const db = client.db('question_feedback');
    const followupCollection = db.collection('followUp');

    const latestFeedback = await followupCollection.findOne({}, { sort: { _id: -1 } });

    let followupIdCounter;

    if (latestFeedback === null) {
      followupIdCounter = 1; // Set a default value if no documents are found
    } else {
      followupIdCounter = latestFeedback._id + 1;
    }
    console.log("Generating Followup...");
    await new Promise(resolve => setTimeout(resolve, 20000));

    const messages = [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: `Based on your previous response:\n\nQuestion: ${previousQuestion}\nAnswer: ${userAnswer}\n\nGenerate a follow-up question:` },
    ];
  
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Use GPT-3.5 Turbo for faster responses
      messages: messages,
    });

    const generatedText = response.choices[0].message.content.toLowerCase();

    console.log("Generated Follow-up Question:", generatedText);

    const followupData = {
      _id: followupIdCounter,
      question: previousQuestion,
      user_answer: userAnswer,
      follow_up_question: generatedText
    };

    await followupCollection.insertOne(followupData);
    console.log("Follow up Feedback: ",followupData);
    return followupData;
  } catch (error) {
    console.error('Error generating follow-up question:', error);
    throw new Error('Failed to generate follow-up question');
  }
}

module.exports = {
  verifyAnswer,
  generateFollowUpQuestion,
};
