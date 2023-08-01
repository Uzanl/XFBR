const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const app = express();
app.use(cookieParser());
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



// ...

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

app.use(
  session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 3600000, // Tempo de expiração de 1 hora
    },
  })
);

// Middleware para verificar a sessão
app.use((req, res, next) => {
  console.log('Session info:', req.session);
  next();
});



// Route to handle form submission - Login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  console.log('Received login request with email:', email);

  // Verificar as credenciais no banco de dados (coloque o código para consultar o banco aqui)
  // Exemplo hipotético:
  const sql = 'SELECT * FROM usuario WHERE email = ? AND senha_usu = ?';
  connection.query(sql, [email, password], (err, result) => {
    if (err) {
      console.error('Error querying the database:', err);
      res.status(500).json({ message: 'Error querying the database' });
      return;
    }

    if (result.length === 0) {
      // Credenciais inválidas
      console.log('Invalid email or password:', email);
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }




   

    req.session.user = result[0];



    // Redirecionar para a página de notícias
    res.json({ message: 'Login successful', redirect: '/notícias.html' });
    console.log('Login successful for user:', result[0]);
  });
});



// Rota para verificar o status de login do usuário
app.get('/checkLoginStatus', (req, res) => {
  // Verificar se o usuário está logado na sessão
  if (req.session.user) {
    // Usuário está logado
    console.log('User is logged in');
    res.json({ isLoggedIn: true });
  } else {
    // Usuário não está logado
    console.log('User is not logged in');
    res.json({ isLoggedIn: false });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
