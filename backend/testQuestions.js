const readline = require('readline');

const { verifyAnswer, generateFollowupQuestion } = require('./questions.js'); // Replace with the correct path to your questions.js file

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function main() {
  console.log('Welcome to the QA Assistant Testing Tool!');
  console.log('Choose an option:');
  console.log('1. Verify Answer');
  console.log('2. Generate Follow-up Question');
  console.log('3. Exit');

  rl.question('Enter your choice (1/2/3): ', async (choice) => {
    switch (choice) {
      case '1':
        await testVerifyAnswer();
        break;
      case '2':
        await testGenerateFollowupQuestion();
        break;
      case '3':
        console.log('Exiting...');
        rl.close();
        process.exit(0);
      default:
        console.log('Invalid choice. Please enter 1, 2, or 3.');
        main();
        break;
    }
  });
}

async function testVerifyAnswer() {
  const question= "What is Sun?"
  console.log('Enter a question: ', (question)); 
    rl.question('Enter a user answer: ', async (userAnswer) => {
      try {
        const isCorrect = await verifyAnswer(question, userAnswer);
        if (isCorrect) {
          console.log('The answer is correct!');
        } else {
          console.log('The answer is incorrect.');
        }
        main();
      } catch (error) {
        console.error('Error:', error.message);
        main();
      }
    });

}

async function testGenerateFollowupQuestion() {
  rl.question('Enter the previous question: ', async (previousQuestion) => {
    rl.question('Enter the user answer to the previous question: ', async (userAnswer) => {
      try {
        const followupQuestion = await generateFollowupQuestion(previousQuestion, userAnswer);
        console.log('Generated Follow-up Question:');
        console.log(followupQuestion);
        main();
      } catch (error) {
        console.error('Error:', error.message);
        main();
      }
    });
  });
}

main();
