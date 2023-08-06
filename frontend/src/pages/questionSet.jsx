import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function QuestionSet() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    // Fetch questions from the backend
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch('http://localhost:5000/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pdfContent: '' }), // Leave pdfContent empty for now
      });

      const data = await response.json();
      const generatedQuestion = data.question;
      setQuestions([generatedQuestion]); // Store the generated question in the state

      // Print the generated question in the console log
      console.log('Generated Question:', generatedQuestion);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  return (
    <div>
      <h2>Question Set</h2>
      <ul>
        {questions.map((question, index) => (
          <li key={index}>{question}</li>
        ))}
      </ul>
      <button onClick={() => navigate('/')}>Go Back to Main Page</button>
    </div>
  );
}

export default QuestionSet;
