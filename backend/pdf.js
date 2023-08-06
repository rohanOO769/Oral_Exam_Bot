const pdf = require('pdf-parse');
const fs = require('fs');

// Read the PDF file
const pdfFilePath = './questions.pdf'; // Replace with your PDF file path
const pdfBuffer = fs.readFileSync(pdfFilePath);

// Function to extract text from the PDF
async function extractText() {
  try {
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
