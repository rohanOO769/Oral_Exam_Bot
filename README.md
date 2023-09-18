# Oral Exam Web App
Note: The Deployed code is in **deploy** branch!
## Overview

#### The Oral Exam Web App is a web-based application that conducts oral exams with students based on information contained in a PDF document. This project combines front-end development with React.js, back-end development with Node.js, natural language processing using a Large Language Model (LLM), and audio processing for speech-to-text and text-to-speech capabilities.
#### This was just the skeleton of the project which involved all the required tasks.
#### It can further be developed by integrating with Machine Learning.
#### Since, it is an virtual interview bot we can make it to track eye movements as well using ML, so the interviewee can't look aside and see their mobile phones to answer the questions!

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)


## Features

1. **Question Generation**: Initial questions are generated from a PDF document using a Large Language Model (LLM). Preprocessing techniques like chunking and embeddings are used to avoid exceeding token limits.

2. **Follow-Up Questions**: The LLM takes on the role of an oral examiner and asks follow-up questions based on the student's responses.

3. **Audio Processing**: The app implements speech-to-text to convert user audio responses into text and text-to-speech to output the LLM's responses as audio.

4. **Web Interface**: A simple web interface is designed with a button that allows users to initiate the oral exam.

5. **Transcript Storage**: Transcripts of interactions, including user responses, LLM prompts, and follow-up questions, are stored for reference and analysis.

## Requirements

To run this project, you'll need the following:

- Node.js and npm installed on your machine.
- Access to a Large Language Model (LLM) for question generation.
- Integration with a speech-to-text service for audio input.
- Integration with a text-to-speech service for audio output.

## Getting Started

1. **Clone the Repository**

cd frontend
2. **Frontend Setup**

Navigate to the `frontend` directory:


Install dependencies and start the development server:

npm install
npm start


3. **Backend Setup**

Open a new terminal and navigate to the `backend` directory:

cd backend

Install dependencies and start the Node.js server:

npm install
node server.js


4. **Configuration**

Configure your frontend to make API requests to the correct backend URL. Update the API endpoints as needed in your frontend code.

## Usage

1. Access the web app in your browser at `http://localhost:3000` (or the appropriate URL).
   ![image](https://github.com/rohanOO769/Oral_Exam_Bot/assets/104089399/8772f3e9-27fc-4df4-b415-3b2c9d9b7e73)
   Hosted Link: https://frontend-8vo3.onrender.com
   
2. Click the "Start Oral Exam" button to initiate the exam.
   ![image](https://github.com/rohanOO769/Oral_Exam_Bot/assets/104089399/49f7ba20-7934-40a1-bcf9-94c0ae292194)

3. Follow the on-screen instructions for answering questions and interacting with the LLM.

## Technologies Used

- React.js (Frontend)
- Node.js (Backend)
- Large Language Model (LLM) for question generation (I've used openai api)
- Speech-to-Text and Text-to-Speech services
- HTML/CSS for web interface
- MongoDB or your preferred database for transcript storage

## Contributing

Contributions are welcome! If you'd like to contribute to this project, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them.
4. Push your changes to your fork.
5. Submit a pull request to the main repository.


