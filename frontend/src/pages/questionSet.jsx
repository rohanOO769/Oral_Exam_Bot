// questionSet.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';

function QuestionSet() {
  const navigate = useNavigate();

  // Your question set components and logic go here

  return (
    <div>
      {/* Display your question set components */}
      <h2>Question Set</h2>
      {/* Add your question components and logic */}
      <button onClick={() => navigate('/')}>Go Back to Main Page</button>
    </div>
  );
}

export default QuestionSet;
