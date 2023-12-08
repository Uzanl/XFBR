const express = require('express');
const sharp = require('sharp');
const compression = require('compression');
const session = require('express-session')
const path = require('path');
const fileUpload = require('express-fileupload');
const XboxApiClient = require('xbox-webapi');
const https = require('https');
const RSS = require('rss');
const Parser = require('rss-parser');
const fs = require('fs');
const mysql = require('mysql2');
const port = 3000;
const app = express();
const dbConfig = require('./script/dbConfig');
const config = require('./script/xbApiConfig.js');
const cors = require('cors');


// Use as chaves do arquivo de configuração
const client = XboxApiClient({
  clientId: config.clientId,
  clientSecret: config.clientSecret
});


app.use(
  session({
    secret: 'key',
    resave: false,
    saveUninitialized: false,
  })
);

app.use(cors());

app.use(express.json({ limit: '200mb' }));

app.use(compression());

app.use(express.json());

app.use(fileUpload());

app.use('/css', express.static(path.join(__dirname, 'css')));

app.use(express.static(path.join(__dirname, 'rsc')));

app.use(express.static(path.join(__dirname, 'fonts')));

app.use(express.static(path.join(__dirname, 'images-preview')));

app.use(express.static(path.join(__dirname, 'profile-images')));

app.use(express.static(path.join(__dirname, 'profile-xbox-images')));

app.use('/script', express.static(path.join(__dirname, 'script')));

app.use(express.static(path.join(__dirname, 'views')));

// Create a connection to the MySQL database
const connection = mysql.createConnection(dbConfig);


// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database!');
});

app.get('/feed.xml', (req, res) => {
  const feed = new RSS({
    title: 'Feed de Notícias',
    feed_url: 'http://localhost:3000/feed.xml',
    site_url: 'http://localhost:3000',
    description: 'Notícias do Meu Site'
  });

  const query = 'SELECT * FROM artigo ORDER BY data_publicacao DESC';

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao obter os artigos do banco de dados:', err);
      res.status(500).send('Erro ao obter os artigos do banco de dados');
      return;
    }

    results.forEach(row => {
      feed.item({
        title: row.titulo,
        url: `http://localhost:3000/artigo/${row.id_artigo}`,
        description: row.previa_conteudo,
        date: row.data_publicacao,
        enclosure: { url: row.imagem_url, type: 'image/webp' }
      });
    });

    const xml = feed.xml({ indent: true });
    res.type('application/rss+xml');
    res.send(xml);
  });
});

const parser = new Parser();

const url = 'http://localhost:3000/feed.xml'; // Substitua pelo URL do seu feed

(async () => {
  try {
    const feed = await parser.parseURL(url);
    console.log('O feed é válido!');
  } catch (err) {
    console.error('Erro ao validar o feed:', err);
  }
})();

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

app.get('/verificar-permissao-editar-artigo/:artigoId', (req, res) => {
  //console.log("chegou aqui!")
  const artigoId = req.params.artigoId;
  // const userIdFromSession = req.session.user.id_usu; // Obtém o ID do usuário da sessão

  let userId;

  if (req.session.user) {

    userId = req.session.user.id_usu;
  } else if (req.session.profileData) {
    const XboxUserId = req.session.profileData.profileUsers[0].id;

    const getUserIdQuery = 'SELECT id_usu FROM usuario WHERE id_usu_xbox = ?';

    connection.query(getUserIdQuery, [XboxUserId], (err, result) => {
      if (err) {
        console.error('Erro ao obter userId:', err);
        return res.status(500).json({ error: 'Erro ao obter userId' });
      }

      if (result.length > 0) {
        userId = result[0].id_usu;

        if (!userId) {
          return res.json({ temPermissao: false });
        }


      } else {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
    });
  } else {
    return res.status(401).json({ redirect: '/login.html' });
  }

  app.delete('/excluir-artigo/:artigoId', (req, res) => {
    const artigoId = req.params.artigoId;

    // Verificar se o usuário está autenticado
    if (req.session.user || req.session.profileData) {
      const deleteArtigoQuery = 'DELETE FROM artigo WHERE id_artigo = ?';
      const selectImageURLQuery = 'SELECT imagem_url FROM artigo WHERE id_artigo = ?';

      connection.query(selectImageURLQuery, [artigoId], async (err, result) => {
        if (err) {
          console.error('Erro ao obter a URL da imagem:', err);
          return res.status(500).json({ error: 'Erro ao obter a URL da imagem' });
        }

        const imageUrl = result[0]?.imagem_url; // Obtendo a URL da imagem do resultado da consulta

        connection.query(deleteArtigoQuery, [artigoId], async (err, result) => {
          if (err) {
            console.error('Erro ao excluir o artigo:', err);
            return res.status(500).json({ error: 'Erro ao excluir o artigo' });
          }
          if (imageUrl) {
            const imagePath = __dirname + '/images-preview/'; 
            const imageName = imageUrl.split('/').pop(); // Obtém o nome do arquivo da URL
            const imageBaseName = imageName.split('.webp')[0]; // Remove a extensão para obter o nome base da imagem

            const variations = ['_720', '_432', '_firstchild']; // Lista de variações de tamanho das imagens

            try {
              // Exclui a imagem original do sistema de arquivos
               fs.unlinkSync(`${imagePath}/${imageName}`);

              // Exclui as variações de tamanho das imagens
              variations.forEach(async (variation) => {
                const variationImageName = `${imageBaseName}${variation}.webp`;
                fs.unlinkSync(`${imagePath}/${variationImageName}`);
              });

              return res.json({ message: 'Artigo e imagens excluídos com sucesso' });
            } catch (error) {
              console.error('Erro ao excluir as imagens:', error);
              return res.status(500).json({ error: 'Erro ao excluir as imagens do artigo' });
            }
          }
          return res.json({ message: 'Artigo excluído com sucesso, mas a imagem não foi encontrada' });
        });
      });
    } else {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
  });


  app.post('/update-article/:id', (req, res) => {
    const idArtigo = req.params.id;
    const { title, contentpreview, content } = req.body;
    const image = req.files ? req.files.image : null;
    const missingFields = [];

    if (!title) missingFields.push('Título');
    if (!content) missingFields.push('Conteúdo');
    if (!contentpreview) missingFields.push('Conteúdo da prévia');
    
    if (missingFields.length > 0) {
      const errorMessage = `Os seguintes campos devem ser preenchidos: ${missingFields.join(', ')}`;
      return res.status(400).json({ error: errorMessage });
    }

    // Aqui você verifica se a imagem não é undefined e não é uma string vazia
    if (image !== undefined && image !== null) {
      const uploadPath = __dirname + '/images-preview/' + image.name.replace(/\.[^/.]+$/, "") + '.webp';

      sharp(image.data)
        .resize(256, 144)
        .webp({ quality: 100 })
        .toFile(uploadPath, (err) => {
          if (err) {
            console.error('Erro ao comprimir e converter a imagem:', err);
            return res.status(500).json({ error: 'Erro ao fazer upload da imagem' });
          } else {
            const newImageName = image.name.replace(/\.[^/.]+$/, "") + '.webp';
            // Execute a atualização no banco de dados
            const sql = 'UPDATE artigo SET titulo=?, imagem_url=?, previa_conteudo=?, conteudo=? WHERE id_artigo=?';
            const values = [title, newImageName, contentpreview, content, idArtigo];

            connection.query(sql, values, (error, results) => {
              if (error) {
                console.error('Erro ao atualizar o artigo:', error);
                res.status(500).json({ error: 'Erro interno no servidor' });
              } else {
                res.status(200).json({ message: 'Artigo atualizado com sucesso' });
              }
            });
          }
        });
    } else {
      // Se a imagem for undefined ou null, apenas atualize os outros campos sem mexer na imagem
      // Execute a atualização no banco de dados
      const sql = 'UPDATE artigo SET titulo=?, previa_conteudo=?, conteudo=? WHERE id_artigo=?';
      const values = [title, contentpreview, content, idArtigo];

      connection.query(sql, values, (error, results) => {
        if (error) {
          console.error('Erro ao atualizar o artigo:', error);
          res.status(500).json({ error: 'Erro interno no servidor' });
        } else {
          res.status(200).json({ message: 'Artigo atualizado com sucesso' });
        }
      });
    }
  });

  // Verificar se o usuário está autenticado (se a sessão está ativa)

  // Consultar o banco de dados para obter o ID do autor do artigo
  connection.query('SELECT id_usu FROM artigo WHERE id_artigo = ?', [artigoId], (err, results) => {
    if (err) {
      console.error('Erro ao verificar permissão de edição:', err);
      return res.status(500).json({ error: 'Erro ao verificar permissão de edição' });
    }

    const artigoAuthorId = results[0].id_usu;

    // Verificar se o usuário é o autor do artigo ou se é um administrador
    if (userId === artigoAuthorId || req.session.userType === 'administrador') {
      return res.json({ temPermissao: true });
    } else {
      return res.json({ temPermissao: false });
    }
  });
});

app.post('/insert-news', (req, res) => {
  let userId;
  if (req.session.user) {
    userId = req.session.user.id_usu;
  } else if (req.session.profileData) {
    const XboxUserId = req.session.profileData.profileUsers[0].id;

    const getUserIdQuery = 'SELECT id_usu FROM usuario WHERE id_usu_xbox = ?';

    connection.query(getUserIdQuery, [XboxUserId], (err, result) => {
      if (err) {
        console.error('Erro ao obter userId:', err);
        return res.status(500).json({ error: 'Erro ao obter userId' });
      }

      if (result.length > 0) {
        userId = result[0].id_usu;
        processInsert();
      } else {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
    });
  } else {
    return res.status(401).json({ redirect: '/login.html' });
  }

  function processInsert() {
    const { title, contentpreview, content } = req.body;
    const image = req.files ? req.files.image : null;
    const missingFields = [];

    if (!title) missingFields.push('Título');
    if (!content) missingFields.push('Conteúdo');
    if (!image)  missingFields.push('URL da imagem'); 
    if (!contentpreview) missingFields.push('Conteúdo da prévia');
    
    if (missingFields.length > 0) {
      const errorMessage = `Os seguintes campos devem ser preenchidos: ${missingFields.join(', ')}`;
      return res.status(400).json({ error: errorMessage });
    }

    const uploadPath = __dirname + '/images-preview/' + image.name.replace(/\.[^/.]+$/, "") + '.webp';

    sharp(image.data)
      .resize(256, 144)
      .webp({ quality: 100 })
      .toFile(uploadPath, (err) => {
        if (err) {
          console.error('Erro ao comprimir e converter a imagem:', err);
          return res.status(500).json({ error: 'Erro ao fazer upload da imagem' });
        } else {
          const newImageName = image.name.replace(/\.[^/.]+$/, "") + '.webp';
          const insertQuery = 'INSERT INTO artigo (titulo, conteudo, data_publicacao, id_usu, imagem_url, previa_conteudo) VALUES (?, ?, ?, ?, ?, ?)';
          const publicationDate = new Date();

          connection.query(insertQuery, [title, content, publicationDate, userId, newImageName, contentpreview], (err, result) => {
            if (err) {
              console.error('Erro ao inserir artigo:', err);
              res.status(500).json({ error: 'Erro ao inserir o artigo' });
            } else {
              // Salvando a versão em resolução maior (860x483)
              const uploadPathFirstChild = __dirname + '/images-preview/' + image.name.replace(/\.[^/.]+$/, "") + '_firstchild.webp';
              sharp(image.data)
                .resize(860, 483)
                .webp({ quality: 100 })
                .toFile(uploadPathFirstChild, (err) => {
                  if (err) {
                    console.error('Erro ao salvar imagem de resolução maior:', err);
                  }
                });

              // Salvando a versão em resolução menor (432x243)
              const uploadPath432 = __dirname + '/images-preview/' + image.name.replace(/\.[^/.]+$/, "") + '_432.webp';
              sharp(image.data)
                .resize(432, 243)
                .webp({ quality: 100 })
                .toFile(uploadPath432, (err) => {
                  if (err) {
                    console.error('Erro ao salvar imagem de resolução intermediária:', err);
                  }
                });

              // Salvando a versão em resolução intermediária (720x405)
              const uploadPath720 = __dirname + '/images-preview/' + image.name.replace(/\.[^/.]+$/, "") + '_720.webp';
              sharp(image.data)
                .resize(720, 405)
                .webp({ quality: 100 })
                .toFile(uploadPath720, (err) => {
                  if (err) {
                    console.error('Erro ao salvar imagem de resolução menor:', err);
                  }
                });

              res.status(200).json({ message: 'Artigo inserido com sucesso' });
            }
          });
        }
      });
  }
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

app.get('/get-articles/:page', compression(), (req, res) => {
  const itemsPerPage = 8;
  const currentPage = req.params.page || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;

  // Consulta para obter os artigos da página atual
  const articlesQuery = `
    SELECT a.id_artigo, a.titulo, DATE_FORMAT(a.data_publicacao, '%d/%m/%Y %H:%i') AS data_formatada, a.id_usu, a.imagem_url, a.previa_conteudo, IFNULL(u.login_usu, ux.gamertag) AS login_usu
    FROM artigo a
    INNER JOIN usuario u ON a.id_usu = u.id_usu 
    LEFT JOIN usuario_xbox ux ON u.id_usu_xbox = ux.id_usu_xbox 
    ORDER BY data_publicacao DESC LIMIT ?, ?
  `;

  connection.query(articlesQuery, [startIndex, itemsPerPage], (err, articles) => {
    if (err) {
      console.error('Erro ao obter as notícias do banco de dados:', err);
      return res.status(500).json({ error: 'Erro ao obter as notícias do banco de dados' });
    }

    // Consulta para obter o total de artigos
    const countQuery = 'SELECT COUNT(*) AS total_count FROM artigo';
    connection.query(countQuery, (err, countResult) => {
      if (err) {
        console.error('Erro ao obter o número total de artigos:', err);
        return res.status(500).json({ error: 'Erro ao obter o número total de artigos' });
      }

      const totalCount = countResult[0].total_count;
      const hasNextPage = articles.length === itemsPerPage;

      res.json({ articles, hasNextPage, currentPage, totalCount });
    });
  });
});


app.get('/get-articles-profile', (req, res) => {

  let userId;

  //console.log(req.query.id);
  const id = parseInt(req.query.id);

  if (!isNaN(id) && id > 1) {
    //console.log("chegou aqui")
    userId = id;
    processArticlesQuery(userId);
  } else {

    if (req.session.user) {
      userId = req.session.user.id_usu;
      processArticlesQuery(userId);
    } else if (req.session.profileData) {
      const XboxUserId = req.session.profileData.profileUsers[0].id;
      const getUserIdQuery = 'SELECT id_usu FROM usuario WHERE id_usu_xbox = ?';

      connection.query(getUserIdQuery, [XboxUserId], (err, result) => {
        if (err) {
          console.error('Erro ao obter userId:', err);
          return res.status(500).json({ error: 'Erro ao obter userId' });
        }

        if (result.length > 0) {
          userId = result[0].id_usu;
          processArticlesQuery(userId);
        } else {
          return res.status(404).json({ error: 'Usuário não encontrado' });
        }
      });
    } else {
      return res.status(401).json({ redirect: '/login.html' });
    }
  }

  function processArticlesQuery(userId) {
    const itemsPerPage = 8;
    const currentPage = req.query.page || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;

    const sqlCount = `
    SELECT COUNT(*) AS total_count 
    FROM artigo a
    WHERE a.id_usu = ?
  `;

    const sql = `
    SELECT 
      a.id_artigo, a.titulo, a.data_publicacao, a.id_usu, a.imagem_url, a.previa_conteudo, 
      IFNULL(usuario.login_usu, ux.gamertag) AS login_usu
    FROM artigo a
    LEFT JOIN usuario ON a.id_usu = usuario.id_usu
    LEFT JOIN usuario_xbox ux ON ux.id_usu_xbox = usuario.id_usu_xbox
    WHERE a.id_usu = ?
    ORDER BY a.data_publicacao DESC LIMIT ?, ?
    
  `;


    connection.query(sqlCount, [userId], (err, countResults) => {
      if (err) {
        console.error('Erro ao contar o número total de artigos:', err);
        return res.status(500).json({ error: 'Erro ao contar o número total de artigos' });
      }

      const totalCount = countResults[0].total_count;

      connection.query(sql, [userId, startIndex, itemsPerPage], (err, results) => {
        if (err) {
          console.error('Erro ao obter as notícias do banco de dados:', err);
          return res.status(500).json({ error: 'Erro ao obter as notícias do banco de dados' });
        }
    
        const articles = results;
  
        const hasNextPage = articles.length > 0; // Não é necessário verificar o comprimento dos resultados aqui, pois não há limite

        res.json({ articles, totalCount, hasNextPage });
      });
    });
  }
});

// Rota para obter dados de um artigo por ID
app.get('/get-article-edit-by-id/:id', (req, res) => {

  //console.log("chegou aqui!")
  const artigoId = req.params.id;

  // Substitua o código abaixo com a lógica para obter os dados do artigo do seu banco de dados
  const getArticleQuery = 'SELECT * FROM artigo WHERE id_artigo = ?';

  connection.query(getArticleQuery, [artigoId], (err, result) => {
    if (err) {
      console.error('Erro ao obter dados do artigo:', err);
      return res.status(500).json({ error: 'Erro ao obter dados do artigo' });
    }

    if (result.length > 0) {
      const artigoData = {
        titulo: result[0].titulo,
        previa_conteudo: result[0].previa_conteudo,
        conteudo: result[0].conteudo,
        imagem_url: result[0].imagem_url,
        // Adicione outros campos conforme necessário
      };

      res.json(artigoData);
    } else {
      res.status(404).json({ error: 'Artigo não encontrado' });
    }
  });
});

// Rota para obter detalhes do artigo pelo ID
app.get('/get-article-by-id/:id', (req, res) => {
  const id = req.params.id;

  const sql = `
    SELECT artigo.titulo, artigo.conteudo,usuario.id_usu, usuario.login_usu, usuario.descricao, usuario.imagem_url , ux.gamertag, ux.gamerscore, ux.imagem_url as imagem_url_xbox
    FROM artigo
    LEFT JOIN usuario ON artigo.id_usu = usuario.id_usu
    LEFT JOIN usuario_xbox ux ON ux.id_usu_xbox = usuario.id_usu_xbox
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

// Rota para obter a contagem total de artigos por perfil
app.get('/get-article-count-profile', (req, res) => {

  let userId;

  //console.log(req.query.id);
  const id = parseInt(req.query.id);

  if (!isNaN(id) && id > 1) {
    //console.log("chegou aqui")
    userId = id;
    processArticlesQuery(userId);
  } else {

    if (req.session.user) {
      userId = req.session.user.id_usu;
      processArticlesQuery(userId);
    } else if (req.session.profileData) {
      const XboxUserId = req.session.profileData.profileUsers[0].id;
      const getUserIdQuery = 'SELECT id_usu FROM usuario WHERE id_usu_xbox = ?';

      connection.query(getUserIdQuery, [XboxUserId], (err, result) => {
        if (err) {
          console.error('Erro ao obter userId:', err);
          return res.status(500).json({ error: 'Erro ao obter userId' });
        }

        if (result.length > 0) {
          userId = result[0].id_usu;
          processArticlesQuery(userId);
        } else {
          return res.status(404).json({ error: 'Usuário não encontrado' });
        }
      });
    } else {
      return res.status(401).json({ redirect: '/login.html' });
    }
  }

  function processArticlesQuery(userId) {
    const sql = 'SELECT COUNT(*) as count FROM artigo WHERE id_usu = ?';
    connection.query(sql, [userId], (err, results) => {
      if (err) {
        console.error('Erro ao obter a contagem total de artigos:', err);
        return res.status(500).json({ error: 'Erro ao obter a contagem total de artigos' });
      }

      const count = results[0].count;

      //console.log(count)
      res.json({ count });
    });
  }

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
    // console.log('Login successful for user:', result[0]);
  });
});

app.get('/get-username/:userId', (req, res) => {
  const userId = req.params.userId;

  const query = `
    SELECT u.login_usu, ux.gamertag 
    FROM usuario u 
    LEFT JOIN usuario_xbox ux ON u.id_usu_xbox = ux.id_usu_xbox 
    WHERE u.id_usu_xbox = ? OR u.id_usu = ?;
  `;

  connection.query(query, [userId, userId], (err, result) => {
    if (err) {
      console.error('Erro ao obter nome de usuário e gamertag:', err);
      res.status(500).json({ error: 'Erro ao obter nome de usuário e gamertag' });
    } else {
      if (result.length > 0) {
        const username = result[0].login_usu || result[0].gamertag;

        res.json({
          username: username,
          gamertag: result[0].gamertag
        });
      } else {
        res.status(404).json({ error: 'Usuário não encontrado' });
      }
    }
  });
});

// Rota para fazer logout
app.get('/logout', (req, res) => {
  // Revogue o token de acesso na Microsoft
  const microsoftAccessToken = client.getAccessToken();

  if (microsoftAccessToken) {
    // Chame a função de revogação do token de acesso, se disponível
    console.log(microsoftAccessToken.access_token);
    req.session.authData = null;
    client.clearTokens();
    res.clearCookie('connect.sid');
  }
  // Destrua a sessão
  res.clearCookie('connect.sid');

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
  (req.session.isAuth) ? res.json({ isLoggedIn: true }) : res.json({ isLoggedIn: false });
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

app.get('/get-user-info/:id', (req, res) => {
  // Verificar se req.session.user está definido
  let userId;
  const id = parseInt(req.params.id);

  if (!isNaN(id) && id > 1) {

    userId = id;
    processUserQuery(userId);
  } else {


    if (req.session.user) {
      userId = req.session.user.id_usu;
      processUserQuery(userId);
    } else if (req.session.profileData) {
      const XboxUserId = req.session.profileData.profileUsers[0].id;
      const getUserIdQuery = 'SELECT id_usu FROM usuario WHERE id_usu_xbox = ?';

      connection.query(getUserIdQuery, [XboxUserId], (err, result) => {
        if (err) {
          console.error('Erro ao obter userId:', err);
          return res.status(500).json({ error: 'Erro ao obter userId' });
        }

        if (result.length > 0) {
          userId = result[0].id_usu;
          processUserQuery(userId);
        } else {
          return res.status(404).json({ error: 'Usuário não encontrado' });
        }
      });
    } else {
      return res.status(401).json({ redirect: '/login.html' });
    }
  }
  function processUserQuery(userId) {
    const selectQuery = `
  SELECT IFNULL(u.login_usu, ux.gamertag) AS login_usu,
  IFNULL(u.descricao, "") AS descricao,
  IFNULL(u.imagem_url, ux.imagem_url) AS imagem_url,
  IFNULL(ux.gamerscore, 0) AS gamerscore
  FROM usuario u
  LEFT JOIN usuario_xbox ux ON u.id_usu_xbox = ux.id_usu_xbox
  WHERE u.id_usu = ?;
`;

    connection.query(selectQuery, [userId], (err, result) => {
      if (err) {
        console.error('Erro ao buscar informações do usuário:', err);
        res.status(500).json({ error: 'Erro ao buscar informações do usuário' });
      } else {
        if (result.length > 0) {
          const userGamertag = result[0].login_usu;
          const userDescription = result[0].descricao;
          const userImageUrl = result[0].imagem_url;
          const userGamerscore = result[0].gamerscore;

          res.status(200).json({ description: userDescription, imageUrl: userImageUrl, gamertag: userGamertag, gamerscore: userGamerscore });
        } else {
          console.error('Usuário não encontrado');
          res.status(404).json({ error: 'Usuário não encontrado' });
        }
      }
    });
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
    }session

    if (result.affectedRows === 1) {
      return res.json({ success: true });
    } else {
      return res.status(500).json({ error: 'Nenhuma linha foi afetada' });
    }
  });
});

// Rota de autenticação
app.get('/auth', (req, res) => {
  
  if (!req.session.authData) {
 
    const url = client.startAuthServer(() => {
      req.session.authData = client._authentication; // Salvar os dados de autenticação na sessão do usuário
    });

    res.redirect(url);
  } else {
    // O usuário já está autenticado, talvez redirecionar para outra página ou enviar uma resposta adequada
    res.send('User already authenticated.');
  }
});

app.get('/profile', (req, res) => {
  client.isAuthenticated().then(() => {
    console.log('cheguei aqui!.');

    client.getProvider('profile').getUserProfile().then(result => {
    /*  console.log('Profile:', result);*/

      req.session.isAuth = true;
      req.session.profileData = result;
    
      const data = req.session.profileData;
      const userGamertag = data.profileUsers[0].settings.find(setting => setting.id === 'Gamertag').value;
      const userGamerscore = data.profileUsers[0].settings.find(setting => setting.id === 'Gamerscore').value;
      const id = result.profileUsers[0].id;

      // Faz o download da imagem do perfil
      const profileImageURL = data.profileUsers[0].settings.find(setting => setting.id === 'GameDisplayPicRaw').value;
      const imagePath = __dirname + '/profile-xbox-images/' + id + '.webp';

      // ...
      const download = https.get(profileImageURL, (response) => {
        const chunks = [];
        response
          .on('data', (chunk) => chunks.push(chunk))
          .on('end', () => {
            // Redimensiona a imagem para 96x96 e a converte para WebP
            sharp(Buffer.concat(chunks))
              .resize(96, 96)
              .webp()
              .toFile(imagePath, (err) => {
                if (err) {
                  console.error('Erro ao redimensionar e converter a imagem:', err);
                  return;
                }
                const newImageName = id + '.webp';
                // Insere a imagem redimensionada e convertida no banco de dados
                const insertImageQuery = `
            INSERT IGNORE INTO usuario_xbox (id_usu_xbox, gamertag, gamerscore, imagem_url) VALUES (?, ?, ?, ?);
          `;

                connection.query(insertImageQuery, [id, userGamertag, userGamerscore, newImageName], (err, result) => {
                  if (err) {
                    console.error('Erro ao inserir a imagem no banco de dados:', err);
                    return;
                  }
                });
              });
          });
      });
      res.redirect('/notícias.html');

    }).catch(error => {
      console.log('Error getting recent achievements:', error);
      res.status(500).json({ error: 'Error getting recent achievements' });
    });

  }).catch(error => {
    console.log('User is not authenticated.', error);
    res.status(401).json({ error: 'User is not authenticated' });
  });
});

app.get('/search', (req, res) => {
  const searchTerm = req.query.term; // Recebe o termo de busca da query string

  const sql = `
    SELECT 
      IFNULL(u.login_usu, ux.gamertag) AS resultado,
      'usuário' AS tipo, u.id_usu AS id
    FROM usuario u 
    LEFT JOIN usuario_xbox ux ON ux.id_usu_xbox = u.id_usu_xbox
    WHERE REGEXP_LIKE(IFNULL(u.login_usu, ux.gamertag), ?)

    UNION

    SELECT 
      titulo AS resultado,
      'artigo' AS tipo, a.id_artigo AS id
    FROM artigo a
    WHERE REGEXP_LIKE(titulo, ?)

    LIMIT 7;
  `;

  const params = [`(^|\\s)${searchTerm}|\\b${searchTerm}\\w*`, `(^|\\s)${searchTerm}|\\b${searchTerm}\\w*`];

  connection.query(sql, params, (err, results) => {
    if (err) {
      console.error('Erro ao realizar a busca:', err);
      return res.status(500).json({ error: 'Erro ao realizar a busca' });
    }

    res.json({ results });
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});