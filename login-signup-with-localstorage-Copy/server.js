require('dotenv').config(); // Load .env file for environment variables
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const axios = require('axios');
const fileUpload = require('express-fileupload');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const tesseract = require('tesseract.js');

const app = express();
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(fileUpload());

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '0000', // Replace with your actual password
  database: 'SignInLogin'
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to Db:', err);
    return;
  }
  console.log('Connected to the database');
});

// Function to analyze text with Groq API
async function analyzeTextWithGroq(text, type = 'heading') {
  const apiKey = process.env.GROQ_API_KEY || "your-groq-api-key";
  const apiUrl = process.env.GROQ_API_URL || "https://api.groq.com/openai/v1/chat/completions";
  try {
    const prompt = type === 'heading'
      ? `Generate a single, concise heading that captures the main idea of this text. Make sure it's brief and to the point:\n\n${text}`
      : `Summarize concisely the following content:\n\n${text}`;

    const response = await axios.post(
      apiUrl,
      {
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: prompt }]
      },
      { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` } }
    );

    const content = response.data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("Unexpected response structure from Groq API");
      return 'Error analyzing text';
    }

    // Remove unwanted introductory phrase from the response
    const cleanHeading = content.replace(/^Here is a concise heading that captures the main idea of the text:\s*/i, '').trim();

    return cleanHeading || content; // Return cleaned heading or original content if cleaning fails
  } catch (error) {
    console.error('Error analyzing text:', error);
    return 'Error analyzing text';
  }
}

app.post('/api/signup', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
  db.query(sql, [name, email, password], (err, result) => {
    if (err) {
      console.error('Error inserting user:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.status(201).json({ message: 'User registered successfully' });
  });
});

// Route for user login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
  db.query(query, [email, password], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.status(200).json({ message: 'Login successful' });
  });
});

// Route for image upload and text extraction
app.post('/api/upload-image', async (req, res) => {
  if (!req.files || !req.files.image) {
    return res.status(400).json({ message: 'No image file uploaded.' });
  }

  const image = req.files.image;

  try {
    const { data: { text: extractedText } } = await tesseract.recognize(
      image.data,
      'eng',
      { logger: m => console.log(m) }
    );

    let cleanedText = extractedText
      .replace(/[^a-zA-Z0-9.,\s\n]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    console.log('Cleaned Text:', cleanedText);

    if (!cleanedText || cleanedText.trim().length === 0) {
      return res.status(400).json({ message: 'No readable text extracted from the image.' });
    }

    const heading = await analyzeTextWithGroq(cleanedText, 'heading');
    const summary = await analyzeTextWithGroq(cleanedText, 'summary');

    res.status(200).json({
      heading,
      extractedText: cleanedText,
      summary,
    });
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ message: 'Failed to process the image.' });
  }
});

app.post('/api/download-pdf', (req, res) => {
  const { heading, extractedText, summary } = req.body;

  if (!heading || !extractedText || !summary) {
    return res.status(400).json({ message: "Heading, extracted text, and summary are required" });
  }

  const doc = new PDFDocument();
  res.setHeader('Content-Disposition', 'attachment; filename=result.pdf');
  res.setHeader('Content-Type', 'application/pdf');
  doc.pipe(res);

  // Add Header with Gradient Background
  const headerGradient = doc.linearGradient(0, 0, doc.page.width, 0);
  headerGradient.stop(0, '#4facfe').stop(1, '#00f2fe');
  doc.rect(0, 0, doc.page.width, 50).fill(headerGradient);

  // Enlarged Logo and Heading in Header
  const logoPath = 'src/Images/image.png';
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 25, 10, { width: 40, height: 40 }); // Enlarged logo
  }
  doc.fontSize(18).fillColor('#ffffff').text(heading, 80, 15, { align: 'left' });

  // Add Content
  doc.moveDown();
  doc.fontSize(12).fillColor('#000000').text(`Extracted Text:\n${extractedText}`, { align: 'left' });
  doc.moveDown();
  doc.fontSize(12).text(`Summary:\n${summary}`, { align: 'left' });

  // Footer with Color and Branding Text
  const footerGradient = doc.linearGradient(0, doc.page.height - 50, doc.page.width, doc.page.height);
  footerGradient.stop(0, '#00f2fe').stop(1, '#4facfe'); // Footer gradient colors
  doc.rect(0, doc.page.height - 50, doc.page.width, 50).fill(footerGradient);
 

  doc.end();
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
