import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import QuestionSet from './pages/questionSet';
import './App.css';


function App() {
  const [micPermissionGranted, setMicPermissionGranted] = useState(false);

  const grantMicPermission = () => {
    // Logic to grant microphone permission goes here
    // For example, you can use the browser's built-in APIs like navigator.mediaDevices.getUserMedia

    // Once permission is granted, update the state
    setMicPermissionGranted(true);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Route for the question set */}
          {micPermissionGranted ? (
            <Route path="/questions" element={<QuestionSet />} />
          ) : (
            <Route path="/questions" element={<Navigate to="/" />} />
          )}

          {/* Main Page */}
          <Route
            path="/"
            element={<MainPage grantMicPermission={grantMicPermission} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

function MainPage({ grantMicPermission }) {
  const navigate = useNavigate();

  const handleAlertClick = () => {
    if (window.confirm("Click OK to grant microphone permission and proceed to the oral exam.")) {
      grantMicPermission();
      navigate('/questions'); // Manually navigate to the QuestionSet component
    }
  };

  return (
  <div className="MainPage">
  <h2>Main Page</h2>
  <button onClick={handleAlertClick}>Begin Oral Exam</button>
  </div>

  );
}


export default App;
