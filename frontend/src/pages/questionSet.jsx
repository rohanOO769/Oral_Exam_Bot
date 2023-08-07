import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function QuestionSet() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);

  useEffect(() => {
    fetchRandomQuestion();
  }, []);

  const fetchRandomQuestion = async () => {
    try {
      const response = await fetch('http://localhost:5000/get-random-question', {
        method: 'POST', // Use POST method
      });
      const data = await response.json();
      const randomQuestion = data.question;
      setCurrentQuestion(randomQuestion);
      setFollowUpQuestion('');
      setUserAnswer('');
    } catch (error) {
      console.error('Error fetching random question:', error);
    }
  };

  const fetchFollowUpQuestion = async () => {
    try {
      const response = await fetch('http://localhost:5000/submit-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answer: userAnswer, currentQuestion }),
      });

      const data = await response.json();
      const generatedFollowUpQuestion = data.followUpQuestion;
      setFollowUpQuestion(generatedFollowUpQuestion);
      addToConversation(currentQuestion, userAnswer, data.isCorrect); // Save question, answer, and correctness
      setCurrentQuestion(generatedFollowUpQuestion); // Set follow-up question as the current question
      setUserAnswer('');
    } catch (error) {
      console.error('Error fetching follow-up question:', error);
    }
  };

  const addToConversation = (question, answer) => {
    const newItem = { question, answer };
    setConversationHistory([...conversationHistory, newItem]);
  };

  const handleAnswerSubmission = () => {
    if (userAnswer.toLowerCase().includes("don't know") || userAnswer.toLowerCase().includes("not sure")) {
      // User doesn't know the answer, provide a motivating response
      const motivatingResponse = "That's alright! Let's move on to the next question.";
  
      // Add both the current question and interviewer's motivating response to the conversation history
      addToConversation("Interviewer:", currentQuestion); // Display interviewer's question
      addToConversation("Interviewer:", motivatingResponse); // Display interviewer's response
  
      // Fetch the next random question
      fetchRandomQuestion();
    } else {
      // User provided an answer, fetch a follow-up question
      fetchFollowUpQuestion();
    }
  };
  
  
  

  return (
    <div>
      {/* Display conversation history */}
      <div>
        <h1>Conversation History</h1>
        <ul>
          {conversationHistory.map((item, index) => (
            <li key={index}>
              <strong>Question:</strong> {item.question}
              <br />
              <strong>Interviewee:</strong> {item.answer}
            </li>
          ))}
        </ul>
      </div>
      <h2>Question Set</h2>

      {/* Display current question */}
      <p>Question: {currentQuestion}</p>

      {/* Input field for user's answer */}
      <textarea
        rows="4"
        cols="50"
        value={userAnswer}
        onChange={(e) => setUserAnswer(e.target.value)}
      />

      {/* Button to submit answer */}
      <button onClick={handleAnswerSubmission}>Submit Answer</button>

      

      {/* Button to go back to the main page */}
      <button onClick={() => navigate('/')}>Go Back to Main Page</button>
    </div>
  );
}

export default QuestionSet;
