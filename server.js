require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const cors = require('cors');

// Initialize Express app
const app = express();

// Middleware for parsing JSON requests
app.use(express.json());

// Set up CORS (Cross-Origin Resource Sharing)
const allowedOrigins = [
  "http://localhost:8080",
  "http://127.0.0.1:8080"
];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST'],
}));

// Use the provided database URL
const dbUrl = "mysql://root:VCrfCzNqTDfkaQBwmMCdPaLizjoyRXIX@autorack.proxy.rlwy.net:45549/railway";

// Parse the URL and configure the connection
const connection = mysql.createConnection(dbUrl);

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to the MySQL database');
});

// Middleware for authentication (check if voter exists)
async function authenticate(req, res, next) {
  const apiKey = req.headers['authorization']?.replace('Bearer ', '');
  if (!apiKey) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  connection.query('SELECT * FROM voters WHERE voter_id = ?', [apiKey], (err, results) => {
    if (err || results.length === 0) {
      return res.status(401).json({ message: 'Forbidden' });
    }
    next(); // Allow the request to continue if authenticated
  });
}

// Helper function to get role based on voter credentials
async function getRole(voter_id, password) {
  return new Promise((resolve, reject) => {
    connection.query('SELECT role FROM voters WHERE voter_id = ? AND password = ?', [voter_id, password], (err, results) => {
      if (err || results.length === 0) {
        reject(new Error('Invalid voter ID or password'));
      } else {
        resolve(results[0].role); // Return the role of the voter
      }
    });
  });
}

// Login route
app.get('/login', authenticate, async (req, res) => {
  const { voter_id, password } = req.query;

  try {
    const role = await getRole(voter_id, password);

    // Generate JWT token upon successful login
    const token = jwt.sign({ voter_id, password, role }, process.env.SECRET_KEY, { algorithm: 'HS256' });

    res.json({ token, role });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
});

// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://127.0.0.1:${PORT}`);
});
