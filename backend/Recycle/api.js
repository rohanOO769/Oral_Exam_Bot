// const OpenAI = require('openai');
// require('dotenv').config();
// const openai = new OpenAI({
//   apiKey: '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', // defaults to process.env["OPENAI_API_KEY"]
// });

// async function main() {
//   const completion = await openai.chat.completions.create({
//     messages: [{ role: 'user', content: `
//     Verify that the answer to the question "What is the capital of France?" is "Paris".
//     If the answer is correct, generate a follow-up question that would help to understand it better.
//   ` }],
//     model: 'gpt-3.5-turbo',
   
//   });

//   console.log(completion.choices[0].text);
// }

// main();

const OpenAI = require('openai');
require('dotenv').config();
const openai = new OpenAI({
  apiKey: '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', // defaults to process.env["OPENAI_API_KEY"]
});

async function main() {
    // const messages = [
    //   { role: 'system', content: 'You are a helpful assistant.' },
    //   { role: 'user', content: 'What is the capital of France?' },
    //   { role: 'assistant', content: 'I believe the capital of France is Paris.' },
    //   { role: 'user', content: 'Is the answer correct?(yes or no)' },
    // ];
  
    // const response = await openai.chat.completions.create({
    //   model: 'gpt-3.5-turbo', // Use GPT-3.5 Turbo for faster responses
    //   messages: messages,
    // });
    
    const previousQuestion = "What is the capital of France?";
  const userAnswer = "Paris";

//   const messages = [
//     { role: 'system', content: 'You are a helpful assistant.' },
//     { role: 'user', content: `Question: ${question}\nUser answer: ${userAnswer}\nSpeak about it (within 100 words)` },
//   ];

//   const response = await openai.chat.completions.create({
//     model: 'gpt-3.5-turbo', // Use GPT-3.5 Turbo for faster responses
//     messages: messages,
//   });

const messages = [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: `Based on your previous response:\n\nQ: ${previousQuestion}\nA: ${userAnswer}\n\nGenerate a follow-up question:` },
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo', // Use GPT-3.5 Turbo for faster responses
    messages: messages,
  });

    const reply = response.choices[0].message.content.toLowerCase();
    console.log(reply);
  }

main();