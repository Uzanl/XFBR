const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const port = 3000; // Change this to your desired port number

app.use(cors());

// Create a connection to the MySQL database
const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'Sony#Xbox*1ç',
  database: 'xfbr',
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database!');
});

// Middleware to parse incoming JSON data
app.use(express.json());

// Route to handle form submission
app.post('/submit', (req, res) => {
  const { name, email, password } = req.body;

  // Perform any server-side validation on the data if needed

  // Insert data into the MySQL database
  const sql = 'INSERT INTO usuario (id_usu, login_usu, email, senha_usu, tipo, status) VALUES (?, ?, ?, ?, ?, ?)';
  connection.query(sql, [0, name, email, password, 'escritor', 'ativo'], (err, result) => {
    if (err) {
      console.error('Error inserting data into the database:', err);
      res.status(500).json({ message: 'Error inserting data into the database' });
      return;
    }

    console.log('Data inserted into the database:', result);
    res.json({ message: 'Account created successfully' });
  });
});
  
  // Start the server
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
