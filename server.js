const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const compression = require('compression');
const session = require('express-session')
const path = require('path');
const fileUpload = require('express-fileupload');
const XboxApiClient = require('xbox-webapi');
const axios = require('axios');




const mysql = require('mysql2');
//const { callbackify } = require('util');
const port = 3000;
const app = express();


app.use(
  session({
    secret: 'key',
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize XboxApiClient
const client = XboxApiClient({
  clientId: '532a110d-0270-4af5-995a-ce65266c50a3',
  clientSecret: 'Gej8Q~UPd.~iGF4jOSlxgK~vPn6px1EPWxGPFdoP'


});

app.use(express.json({ limit: '200mb' }));

app.use(compression());

app.use(express.json());

app.use(fileUpload());

app.use('/css', express.static(path.join(__dirname, 'css')));

app.use(express.static(path.join(__dirname, 'rsc')));

app.use(express.static(path.join(__dirname, 'images-preview')));

app.use(express.static(path.join(__dirname, 'profile-images')));

app.use('/script', express.static(path.join(__dirname, 'script')));

app.use(express.static(path.join(__dirname, 'views')));

// Rota para a página de notícias
//app.get('/notícias.html', (req, res) => {
//  res.sendFile(path.join(__dirname, 'views', 'notícias.html'));
//});



//app.get("/", (req, res) => {
//  res.sendFile(path.join(__dirname, 'views', 'login.html'));
//});


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

  if (!req.session.user) {
    // Se a sessão do usuário não estiver definida, redirecione para a tela de login
    return res.status(401).json({ redirect: '/login.html' });
  }

  console.log(req.body);
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

  // Use o sharp para comprimir e converter a imagem para WebP
  const uploadPath = __dirname + '/images-preview/' + image.name.replace(/\.[^/.]+$/, "") + '.webp'; // Nome do arquivo com extensão .webp



  sharp(image.data)
    .resize(640, 360)
    .webp({ quality: 100 })
    .toFile(uploadPath, (err) => {
      if (err) {
        console.error('Erro ao comprimir e converter a imagem:', err);
        return res.status(500).json({ error: 'Erro ao fazer upload da imagem' });
      } else {
        // Após a conversão da imagem, continue com a inserção no banco de dados
        const newImageName = image.name.replace(/\.[^/.]+$/, "") + '.webp'; // Nome da imagem convertida para WebP
        const insertQuery = 'INSERT INTO artigo (titulo, conteudo, data_publicacao, id_usu, imagem_url, previa_conteudo) VALUES (?, ?, ?, ?, ?, ?)';
        const publicationDate = new Date();
        // const encodedContent = encodeURIComponent(content);

        connection.query(insertQuery, [title, content, publicationDate, userId, newImageName, contentpreview], (err, result) => {
          if (err) {
            console.error('Erro ao inserir artigo:', err);
            res.status(500).json({ error: 'Erro ao inserir o artigo' });
          } else {
            res.status(200).json({ message: 'Artigo inserido com sucesso' });
          }
        });
      }
    });
});

app.post('/upload', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ redirect: '/login.html' });
  }

  const userId = req.session.user.id_usu;
  const imageData = req.body; // Receber os dados da imagem do corpo da requisição

  if (!imageData.image) {
    return res.status(400).json({ error: 'Nenhuma imagem foi fornecida' });
  }

  const imageBuffer = Buffer.from(imageData.image.split(',')[1], 'base64'); // Remover o prefixo 'data:image/png;base64,'

  const uploadPath = __dirname + '/profile-images/' + userId + '.webp';

  sharp(imageBuffer)
    .resize(100, 100)
    .webp({ quality: 100 })
    .toFile(uploadPath, (err) => {
      if (err) {
        console.error('Erro ao comprimir e converter a imagem:', err);
        return res.status(500).json({ error: 'Erro ao fazer upload da imagem' });
      }

      const imageUrl = userId + '.webp';

      const updateQuery = 'UPDATE usuario SET imagem_url = ? WHERE id_usu = ?';
      connection.query(updateQuery, [imageUrl, userId], (err, result) => {
        if (err) {
          console.error('Erro ao atualizar a imagem do usuário:', err);
          res.status(500).json({ error: 'Erro ao atualizar a imagem do usuário' });
        } else {
          res.status(200).json({ message: 'Imagem do usuário atualizada com sucesso' });
        }
      });
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

// Rota para obter detalhes do artigo pelo ID
app.get('/get-article-by-id/:id', (req, res) => {
  const id = req.params.id;

  const sql = `
    SELECT artigo.titulo, artigo.conteudo, usuario.descricao, usuario.imagem_url
    FROM artigo
    INNER JOIN usuario ON artigo.id_usu = usuario.id_usu
    WHERE artigo.id_artigo = ?
  `;

  connection.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Erro ao obter o artigo do banco de dados:', err);
      return res.status(500).json({ error: 'Erro ao obter o artigo do banco de dados' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Artigo não encontrado' });
    }

    const article = results[0];
    res.json(article);
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







app.post('/login', (req, res) => {
  const { email, password } = req.body;

  console.log('Received login request with email:', email);

  const missingFields = [];

  if (!email) {
    missingFields.push('E-mail');
  }

  if (!password) {
    missingFields.push('Senha');
  }

  if (missingFields.length > 0) {
    const errorMessage = `Os seguintes campos devem ser preenchidos: ${missingFields.join(', ')}`;
    return res.status(400).json({ error: errorMessage });
  }

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
    res.json({ success: true, redirect: '/notícias.html' });
    console.log('Login successful for user:', result[0]);
  });
});



app.get('/get-username/:userId', (req, res) => {
  const userId = req.params.userId; // Correção: Atribuir o valor antes de usá-lo

  // Consulta ao banco de dados para obter o login_usu com base no id_usu
  const query = 'SELECT login_usu FROM usuario WHERE id_usu = ?';

  connection.query(query, [userId], (err, result) => {
    if (err) {
      console.log('Erro ao obter nome de usuário:', err);
      console.error('Erro ao obter nome de usuário:', err);
      res.status(500).json({ error: 'Erro ao obter nome de usuário' });
    } else {
      if (result.length > 0) {
        res.json({ username: result[0].login_usu });
      } else {
        res.status(404).json({ error: 'Usuário não encontrado' });
      }
    }
  });
});


//app.get("/",(req,res)=>{
//    req.session.isAuth = true;
//    console.log(req.session)
//    res.send("Hello Session Tut")
//});

// Rota para fazer logout
app.get('/logout', (req, res) => {
  
  // Revogue o token de acesso na Microsoft
  const microsoftAccessToken = client.getAccessToken();

  console.log(microsoftAccessToken);

  if (microsoftAccessToken) {
    // Chame a função de revogação do token de acesso, se disponível
    //client.revokeAccessToken(microsoftAccessToken);

    console.log(microsoftAccessToken);
  }

  // Destrua a sessão
  authData = null;
  res.clearCookie('connect.sid');

  //localStorage.removeItem('isLoggedIn');


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

app.get('/get-user-info', (req, res) => {
  // Verificar se req.session.user está definido
  if (req.session.user && req.session.user.id_usu) {
    const userId = req.session.user.id_usu;
    const selectQuery = 'SELECT descricao, imagem_url FROM usuario WHERE id_usu = ?';

    connection.query(selectQuery, [userId], (err, result) => {
      if (err) {
        console.error('Erro ao buscar informações do usuário:', err);
        res.status(500).json({ error: 'Erro ao buscar informações do usuário' });
      } else {
        if (result.length > 0) {
          const userDescription = result[0].descricao;
          const userImageUrl = result[0].imagem_url;
          res.status(200).json({ description: userDescription, imageUrl: userImageUrl });
        } else {
          console.error('Usuário não encontrado');
          res.status(404).json({ error: 'Usuário não encontrado' });
        }
      }
    });
  } else if (req.session.profileData) {
    // Aqui, você pode acessar os detalhes do perfil do Xbox Live
    const data = req.session.profileData;
  
    const userGamertag = data.profileUsers[0].settings.find(setting => setting.id === 'Gamertag').value;
    //console.log('Gamertag:', userGamertag);
  
    const userGamerscore = data.profileUsers[0].settings.find(setting => setting.id === 'Gamerscore').value;
    // console.log('Gamerscore:', userGamerscore);
  
    const userProfilePic = data.profileUsers[0].settings.find(setting => setting.id === 'GameDisplayPicRaw').value;
    //console.log('User Profile Picture URL:', userProfilePic);
  
    res.status(200).json({ gamertag: userGamertag, gamerscore: userGamerscore, profilepic: userProfilePic });
  } else {
    // Caso nenhum dos dois esteja definido
    console.error('Usuário não autenticado ou dados de perfil do Xbox Live ausentes');
    res.status(401).json({ error: 'Usuário não autenticado ou dados de perfil do Xbox Live ausentes' });
  }
});


// Rota para atualizar a descrição do usuário
app.post('/update-description', (req, res) => {
  const newDescription = req.body.description;

  // Recupere o ID do usuário a partir de suas credenciais ou da sessão (dependendo de como você implementou)
  const userId = req.session.user.id_usu;

  if (!userId) {
    return res.status(401).json({ error: 'Usuário não autenticado' });
  }

  const sql = 'UPDATE usuario SET descricao = ? WHERE id_usu = ?';

  connection.query(sql, [newDescription, userId], (err, result) => {
    if (err) {
      console.error('Erro ao atualizar descrição:', err);
      return res.status(500).json({ error: 'Erro ao atualizar a descrição' });
    }

    if (result.affectedRows === 1) {
      return res.json({ success: true });
    } else {
      return res.status(500).json({ error: 'Nenhuma linha foi afetada' });
    }
  });
});


// Store authentication data
let authData = null;

// Start authentication flow
app.get('/auth', (req, res) => {
  if (!authData) {
    const url = client.startAuthServer(() => {


      console.log('Authentication is done. User logged in');
      authData = client._authentication;


    });

    res.redirect(url);
  }

 // res.send('Authentication started. Check console for details.');
});

// Rota para obter as conquistas recentes do usuário autenticado
app.get('/profile', (req, res) => {


  client.isAuthenticated().then(() => {
    console.log('User is authenticated.');

    client.getProvider('profile').getUserProfile().then(result => {
      console.log('Profile:', result);

      req.session.isAuth = true;

      req.session.profileData = result;

      //res.send(result);

      res.redirect('/notícias.html')

    }).catch(error => {
      console.log('Error getting recent achievements:', error);
      res.status(500).json({ error: 'Error getting recent achievements' });
    });




    

  }).catch(error => {
    console.log('User is not authenticated.', error);
    res.status(401).json({ error: 'User is not authenticated' });
  });

});



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});