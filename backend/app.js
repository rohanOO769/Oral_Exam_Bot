const axios = require('axios');
const readline = require('readline');

const apiKey = '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';
const baseUrl = 'https://api.openai.com/v1/engines/davinci/completions';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function generateResponse(prompt) {
  try {
    const response = await axios.post(baseUrl, {
      prompt: prompt,
      max_tokens: 50,
      temperature: 0.7,
      stop: ['\n']
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    });

    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
}

async function startConversation() {
  let userResponse = await generateResponse("Please ask a question: ");
  console.log("AI: " + userResponse);

  while (true) {
    rl.question('Your answer: ', async (userAnswer) => {
      if (userAnswer.toLowerCase() === 'exit') {
        console.log('Goodbye!');
        rl.close();
        return;
      }

      const followUpQuestion = await generateResponse(`You said: ${userAnswer}\nNow, please answer this question:`);
      console.log("AI: " + followUpQuestion);

      rl.question('Your answer: ', async (userNextAnswer) => {
        if (userNextAnswer.toLowerCase() === 'exit') {
          console.log('Goodbye!');
          rl.close();
          return;
        }

        // Generate another follow-up question based on user's answer
        const nextFollowUpQuestion = await generateResponse(`You said: ${userNextAnswer}\nNow, please answer this question:`);
        console.log("AI: " + nextFollowUpQuestion);

        startConversation();
      });
    });
  }
}

startConversation();
