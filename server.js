const express = require('express');
const compression = require('compression');
const session = require('express-session')
const path = require('path');
const fileUpload = require('express-fileupload');

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
    secret: 'key',
    resave: false,
    saveUninitialized: false,
  })
);

app.use(compression()); 

app.use(express.json());

app.use(fileUpload());

app.use('/css', express.static(path.join(__dirname, 'css')));

app.use(express.static(path.join(__dirname, 'rsc')));

app.use('/script', express.static(path.join(__dirname, 'script')));

app.use(express.static(path.join(__dirname, 'views')));

// Rota para a página de notícias
app.get('/notícias.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'notícias.html'));
});



app.get("/", (req, res) => {
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


app.post('/insert-news', (req, res) => {
  const { title, contentpreview, content } = req.body;
  const image = req.files ? req.files.image : null; // Acessar o arquivo de imagem enviado

  const missingFields = [];

  // Verificação de campos vazios
  if (!title) {
    missingFields.push('Título');
  }

  if (!content) {
    missingFields.push('Conteúdo');
  }

  if (!image) {
    missingFields.push('URL da imagem');
  }

  if (!contentpreview) {
    missingFields.push('Conteúdo da prévia');
  }

  if (missingFields.length > 0) {
    const errorMessage = `Os seguintes campos devem ser preenchidos: ${missingFields.join(', ')}`;
    return res.status(400).json({ error: errorMessage });
  }

  const userId = req.session.user.id_usu; // Captura o ID do usuário da sessão

  const insertQuery = 'INSERT INTO artigo (titulo, conteudo, data_publicacao, id_usu, imagem_url, titulo_previa, previa_conteudo) VALUES (?, ?, ?, ?, ?, ?, ?)';
  const publicationDate = new Date();

  connection.query(insertQuery, [title, content, publicationDate, userId, image.name, contentpreview, content], (err, result) => {
    if (err) {
      console.error('Erro ao inserir artigo:', err);
      res.status(500).json({ error: 'Erro ao inserir o artigo' });
    } else {
      // Use o método mv() para mover o arquivo para o diretório desejado
      const uploadPath = __dirname + '/images-preview/' + image.name;
      image.mv(uploadPath, (err) => {
        if (err) {
          console.error('Erro ao mover o arquivo:', err);
          return res.status(500).json({ error: 'Erro ao fazer upload da imagem' });
        } else {
          res.status(200).json({ message: 'Artigo inserido com sucesso' });
        }
      });
    }
  });
});




app.get('/get-articles', (req, res) => {
  const itemsPerPage = 8; // Quantidade de notícias por página
  const currentPage = req.query.page || 1; // Página atual (padrão é 1)
  const startIndex = (currentPage - 1) * itemsPerPage;

  const sql = 'SELECT * FROM artigo ORDER BY data_publicacao DESC LIMIT ?, ?';
  connection.query(sql, [startIndex, itemsPerPage], (err, results) => {
    if (err) {
      console.error('Erro ao obter as notícias do banco de dados:', err);
      return res.status(500).json({ error: 'Erro ao obter as notícias do banco de dados' });
    }

    const articles = results;
    const hasNextPage = articles.length === itemsPerPage;
    res.json({ articles, hasNextPage });
  });
});

// Rota para obter a contagem total de artigos
app.get('/get-article-count', (req, res) => {
  const sql = 'SELECT COUNT(*) as count FROM artigo'; // Substitua 'artigo' pelo nome da sua tabela de artigos
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Erro ao obter a contagem total de artigos:', err);
      return res.status(500).json({ error: 'Erro ao obter a contagem total de artigos' });
    }

    const count = results[0].count;

    //console.log(count)
    res.json({ count });
  });
});







app.post('/login', bodyParser.urlencoded(), (req, res) => {



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

// Rota para fazer logout
app.get('/logout', (req, res) => {
  // Destruir a sessão
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});


// Rota para verificar o status de login do usuário
app.get('/checkLoginStatus', (req, res) => {
  // Verificar se o usuário está logado na sessão
  if (req.session.isAuth) {
    // Usuário está logado
    //console.log('User is logged in');
    res.json({ isLoggedIn: true });
  } else {
    // Usuário não está logado
    //console.log('User is not logged in');
    res.json({ isLoggedIn: false });
  }
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});