// questionSet.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Axios from "axios";
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
        method: 'POST',
      });
      const data = await response.json();
      console.log('Received data:', data);
      const randomQuestion = data.question;
      setCurrentQuestion(randomQuestion);
      setFollowUpQuestion('');
      setUserAnswer('');
    } catch (error) {
      console.error('Error fetching random question:', error);
    }
  };

  const fetchFollowUpQuestion = async (req, res) => {
    try {
      // Add the current question and user answer to the conversation history
      addToConversation(currentQuestion, userAnswer);
  
      // Send the user's answer to the server for follow-up question generation
      const response = await fetch('http://localhost:5000/submit-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answer: userAnswer, currentQuestion }),
      });
      
      try {
        const response2 = await Axios.post('http://localhost:5000/get-follow-up-question', {});
        const responseData = response2.data;
      
        if (responseData.follow_up_question === null || responseData.follow_up_question === '') {
          // If follow_up_question is null or empty, use previous question as current question

          setFollowUpQuestion(''); // Clear follow-up question
          setUserAnswer(''); // Clear user answer
          // Add feedback to the conversation
          addToConversation(responseData.feedback);
        } else {
          // If follow_up_question is not null, update the current question
          setCurrentQuestion(responseData.follow_up_question);
          setFollowUpQuestion(''); // Clear follow-up question
          setUserAnswer(''); // Clear user answer
        }
      } catch (error) {
        console.error('Error fetching follow-up question:', error);
        // Handle the error appropriately, e.g., return an error response to the client.
        return res.status(500).json({ error: 'Error fetching follow-up question from the server' });
      }
            
    } catch (error) {
      console.error('Error fetching: ', error);
    }
      
  };
  

  // const addToConversation = (question, answer) => {
  //   const newItem = { question, answer };
  //   setConversationHistory([...conversationHistory, newItem]);
  // };

  const addToConversation = (question, answer) => {
    // Create a new item with the current question and answer
    const newItem = { question, answer };
    
    // Update the conversation history by appending the new item to the existing array
    setConversationHistory((prevHistory) => [...prevHistory, newItem]);
  };
  

  const handleAnswerSubmission = () => {
    // Handle user's answer submission logic here
    fetchFollowUpQuestion();
  };

  return (
    <div>
      {/* Display conversation history */}
      <div>
        <h1>Conversation History</h1>
        <ul>
          {conversationHistory.map((item, index) => (
            <li key={index}>
              <strong>Interviewer:</strong> {item.question}
              <br />
              <strong>Interviewee:</strong> {item.answer}
            </li>
          ))}
        </ul>
      </div>

      <h2>Question Set</h2>

      {/* Display current question */}
      <p><strong>Question:</strong> {currentQuestion}</p>

      {/* Input field for user's answer */}
      <div>
        <label htmlFor="userAnswer">Your Answer:</label>
        <textarea
          id="userAnswer"
          rows="4"
          cols="50"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
        />
      </div>

      {/* Button to submit answer */}
      <button onClick={handleAnswerSubmission}>Submit Answer</button>

      {/* Button to go back to the main page */}
      <button onClick={() => navigate('/')}>Go Back to Main Page</button>
    </div>
  );
}

export default QuestionSet;
