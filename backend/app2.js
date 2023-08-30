const { MongoClient } = require('mongodb');
require('dotenv').config();
// Replace <password> with your actual MongoDB Atlas password
const uri = process.env.MONGO_CLIENT;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function connectToMongoDB() {
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');

    const db = client.db("question_feedback");
    const followupCollection = db.collection("followUp");

    // Retrieve the latest user response from the collection
    const latestResponse = await followupCollection.findOne({}, { sort: { _id: -1 } });

    if (latestResponse) {
      // Extract the question, user answer, and follow-up question from the response
      const question = latestResponse.question;
      const userAnswer1 = latestResponse.user_answer;
      const followUpQuestion = latestResponse.follow_up_question;

      // Print the extracted information
      console.log("Question:", question);
      console.log("User Answer:", userAnswer1);
      console.log("Follow-Up Question:", followUpQuestion);
    } else {
      // If no response was found, print a message indicating that
      console.log("No user responses found in the database.");
    }

  } catch (error) {
    console.error('Error connecting to MongoDB Atlas:', error);
  } finally {
    // Close the MongoDB connection
    client.close();
  }
}

connectToMongoDB();
