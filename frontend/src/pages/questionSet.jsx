// questionSet.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Axios from "axios";
import './QuestionSet.css';



function QuestionSet() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isRecording, setIsRecording] = useState(false); // Track whether recording is active
  const [recognition, setRecognition] = useState(null); // SpeechRecognition object
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(true);
  const [isTextToSpeechSupported, setIsTextToSpeechSupported] = useState('speechSynthesis' in window);

  const url = "https://backend-5f1p.onrender.com";

  useEffect(() => {
    fetchRandomQuestion();
    // Check if the SpeechRecognition API is available
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.continuous = true; // Allow continuous recognition
      recognition.interimResults = true; // Get interim results as the user speaks
      recognition.onresult = handleSpeechRecognitionResult;
      setRecognition(recognition);
    } else {
      // Handle the case when speech recognition is not supported
      setIsSpeechRecognitionSupported(false);
      console.error('Speech recognition is not supported in this browser.');
    }
  }, []);


  const handleSpeechRecognitionResult = (event) => {
    // Handle speech recognition results here
    const transcript = event.results[0][0].transcript;
    setUserAnswer(transcript);
  };

  const toggleRecording = () => {
    // Start or stop recording based on the current state
    if (!isRecording) {
      recognition.start();
      setIsRecording(true);
    } else {
      recognition.stop();
      setIsRecording(false);
    }
  };

  const handleRecordAnswer = () => {
    

    // Clear the user's answer field
    setUserAnswer('');
  };
  
  const speakQuestion = () => {
    if (isTextToSpeechSupported) {
      const synth = window.speechSynthesis;
      const questionUtterance = new SpeechSynthesisUtterance(currentQuestion);
      synth.speak(questionUtterance);
    }
  };

  const fetchRandomQuestion = async () => {
    try {
      const response = await fetch(url+'/get-random-question', {
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
      const response = await fetch(url+'/submit-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answer: userAnswer, currentQuestion }),
      });
      
      try {
        const response2 = await Axios.post(url+'/get-follow-up-question', {});
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
    <div id="conversation-history">
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

      {isSpeechRecognitionSupported ? (
        <div id="interview-question">
          <p>Interviewer's Question:</p>
          <p><strong>{currentQuestion}</strong></p>
          <button id="speak-question-button" onClick={speakQuestion}>Speak Question</button>
        </div>
      ) : (
        <p>Speech recognition is not supported in this browser.</p>
      )}
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
      <button id="submit-answer-button" onClick={handleAnswerSubmission}>Submit Answer</button>

      {/* Button to go back to the main page */}
      <button id="go-back-button" onClick={() => navigate('/')}>Go Back to Main Page</button>

      {/* Button to toggle speech input recording */}
      <button className={`recording-button ${isRecording ? '' : 'disabled-button'}`} onClick={toggleRecording}>
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>

      {/* Button to record the captured speech as an answer */}
      <button id="record-answer-button" onClick={handleRecordAnswer} disabled={!userAnswer}>
        Reset Answer
      </button>
      
      
    </div>
  );
}



export default QuestionSet;


