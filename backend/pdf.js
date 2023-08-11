// pdf.js

const pdf = require('pdf-parse');
const fs = require('fs');

const pdfFilePath = './questions.pdf'; // Replace with your PDF file path

async function extractText() {
  try {
    const pdfBuffer = fs.readFileSync(pdfFilePath);
    const data = await pdf(pdfBuffer);
    return data.text;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    return '';
  }
}

module.exports = {
  extractText
};
