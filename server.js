const express = require('express');
const session = require('express-session')
const path = require('path');
//const cors = require('cors');

const mysql = require('mysql');
const bodyParser = require('body-parser');
const port = 3000;
const app = express();




//app.use(cors({
 // origin: 'http://127.0.0.1:5500',
 // credentials: true,
//}));

app.use(
session({
  secret:'key',
  resave: false,
  saveUninitialized: false,
})
);
app.use(express.json());

app.use('/css', express.static(path.join(__dirname, 'css')));

app.use(express.static(path.join(__dirname, 'rsc')));

app.use('/script', express.static(path.join(__dirname, 'script')));

app.use(express.static(path.join(__dirname, 'views')));

// Rota para a página de notícias
app.get('/notícias.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'notícias.html'));
});



app.get("/",(req,res)=>{
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});


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

// ... código anterior ...



// ...

app.post('/submit', (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  const missingFields = [];
console.log(req.body)
  // Verificação de campos vazios
  if (!name) {
    missingFields.push('Nome');
  }
  
  if (!email) {
    missingFields.push('Email');
  }
  
  if (!password) {
    missingFields.push('Senha');
  }
  
  if (!confirmPassword) {
    missingFields.push('Confirmar Senha');
  }

  if (missingFields.length > 0) {
    const errorMessage = `Os seguintes campos devem ser preenchidos: ${missingFields.join(', ')}`;
    return res.status(400).json({ error: errorMessage });
  }

  // Verificação se as senhas coincidem
  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'As senhas não coincidem' });
  }

  // Inserir dados no banco de dados MySQL
  const sql = 'INSERT INTO usuario (id_usu, login_usu, email, senha_usu, tipo, status) VALUES (?, ?, ?, ?, ?, ?)';
  connection.query(sql, [0, name, email, password, 'escritor', 'ativo'], (err, result) => {
    if (err) {
      console.error('Erro ao inserir dados no banco de dados:', err);
      return res.status(500).json({ error: 'Erro ao inserir dados no banco de dados' });
    }

    console.log('Dados inseridos no banco de dados:', result);
    return res.status(200).json({ success: true });
  });
});






app.post('/login',bodyParser.urlencoded(),(req, res) => {



  const { email, password } = req.body;

  console.log('Received login request with email:', email);

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

    // Credenciais válidas
    req.session.isAuth = true;
    req.session.user = result[0];

    // Redirecionar para a página de notícias
    res.redirect('/notícias.html');
    console.log('Login successful for user:', result[0]);
  });
});

//app.get("/",(req,res)=>{
//    req.session.isAuth = true;
//    console.log(req.session)
//    res.send("Hello Session Tut")
//});


// Rota para verificar o status de login do usuário
app.get('/checkLoginStatus', (req, res) => {
  // Verificar se o usuário está logado na sessão
  if (req.session.isAuth) {
    // Usuário está logado
    console.log('User is logged in');
    res.json({ isLoggedIn: true });
  } else {
    // Usuário não está logado
    console.log('User is not logged in');
    res.json({ isLoggedIn: false });
  }
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});