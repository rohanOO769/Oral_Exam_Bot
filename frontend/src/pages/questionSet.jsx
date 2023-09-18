// questionSet.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './QuestionSet.css';



function QuestionSet() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [userAnswer, setUserAnswer] = useState('');

  const [conversationHistory, setConversationHistory] = useState([]);
  const [isRecording, setIsRecording] = useState(false); // Track whether recording is active
  const [recognition, setRecognition] = useState(null); // SpeechRecognition object
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(true);
  const [isTextToSpeechSupported, setIsTextToSpeechSupported] = useState('speechSynthesis' in window);
  const [feedbackToRead, setFeedbackToRead] = useState('');
  const url = "http://localhost:5000";

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
      setUserAnswer('');
    } catch (error) {
      console.error('Error fetching random question:', error);
    }
  };

  const fetchFollowUpQuestion = async () => {
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
  
      if (response.ok) {
        try {
          const data = await response.json();
          console.log('Follow up data at frontend:', data);
          
          if (data.feedback) {
            // Handle the feedback received from the server (e.g., display it to the user)
            console.log('Feedback:', data.feedback);
            addToConversation(data.feedback);
            setFeedbackToRead(data.feedback);
          }

          if (data.follow_up_question) {
            // Update the current question with the follow-up question
            setCurrentQuestion(data.follow_up_question);
          } else {
            // Handle the case where there is no follow-up question
            console.log('No follow-up question available.');
          }
  
        } catch (error) {
          console.error('Error parsing server data:', error);
        }
      } else {
        console.error('Error submitting the answer:', response.statusText);
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

  const readFeedback = () => {
    if (isTextToSpeechSupported && feedbackToRead) {
      const synth = window.speechSynthesis;
      const feedbackUtterance = new SpeechSynthesisUtterance(feedbackToRead);
      synth.speak(feedbackUtterance);
    }
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

      {/* Button to read feedback */}
      <button id="read-feedback-button" onClick={readFeedback} disabled={!feedbackToRead}>
        Read Feedback
      </button>
      
      
    </div>
  );
}



export default QuestionSet;


