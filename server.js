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
const dbConfig = require('./config/dbConfig');
const config = require('./config/xbApiConfig.js');
const { promisify } = require('util');
const cors = require('cors');
const zlib = require('zlib');

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

app.use(compression({
  brotli: {
    enabled: true,
    zlib: {
      params: {
        [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
      }
    }
  }
}));

// Middleware para bloquear acesso à rota /config
app.use('/config', (req, res, next) => {
  res.status(403).send('Acesso proibido');
});

app.set('view engine', 'ejs');
app.get('/noticias', (req, res) => {
  const userLoggedIn = req.session.idxbox !== undefined; // Verifica se o usuário está logado
  tipoUsuario = req.session.userType;
  imgpath =  req.session.idxbox + '.webp'; // Atualiza o caminho da imagem
  const isAdmin = tipoUsuario === "administrador"
  idUsu = req.session.userId;
  perfilLink = `/perfil.html?page=1&id=${idUsu}`; // Atualiza o link do perfil
  res.render('notícias', { userLoggedIn, isAdmin, imgpath, perfilLink});
});

app.get('/info', (req, res) => {
  const userLoggedIn = req.session.idxbox !== undefined; // Verifica se o usuário está logado
  tipoUsuario = req.session.userType;
  imgpath =  req.session.idxbox + '.webp'; // Atualiza o caminho da imagem
  idUsu = req.session.userId;
  perfilLink = `/perfil.html?page=1&id=${idUsu}`; // Atualiza o link do perfil
  res.render('info', { userLoggedIn, imgpath, perfilLink});
});

app.get('/batepapo', (req, res) => {
  const userLoggedIn = req.session.idxbox !== undefined; // Verifica se o usuário está logado
  tipoUsuario = req.session.userType;
  imgpath =  req.session.idxbox + '.webp'; // Atualiza o caminho da imagem
  idUsu = req.session.userId;
  perfilLink = `/perfil.html?page=1&id=${idUsu}`; // Atualiza o link do perfil
  res.render('bate-papo', { userLoggedIn, imgpath, perfilLink});
});

app.get('/login', (req, res) => {
  //const userLoggedIn = req.session.idxbox !== undefined; // Verifica se o usuário está logado
  //tipoUsuario = req.session.userType;
  //imgpath =  req.session.idxbox + '.webp'; // Atualiza o caminho da imagem
  //idUsu = req.session.userId;
  //perfilLink = `/perfil.html?page=1&id=${idUsu}`; // Atualiza o link do perfil
  res.render('login');
});


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



/*app.get('/feed.xml', (req, res) => {
  const feed = new RSS({
    title: 'Feed de Notícias',
    feed_url: 'https://localhost:3000/feed.xml',
    site_url: 'https://localhost:3000',
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
        url: `https://localhost:3000/artigo/${row.id_artigo}`,
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

const url = 'https://localhost:3000/feed.xml'; // Substitua pelo URL do seu feed

(async () => {
  try {
    const feed = await parser.parseURL(url);
    console.log('O feed é válido!');
  } catch (err) {
    console.error('Erro ao validar o feed:', err);
  }
})();*/

const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Rota para obter o tipo do usuário e verificar o status de login
app.get('/getUserStatus', (req, res) => {
  try {
    let userId;

    if (req.session.user) {
      userId = req.session.user.id_usu;
      const sql = 'SELECT tipo FROM usuario WHERE id_usu = ?';
      connection.query(sql, [userId], (err, results) => {
        if (err) {
          console.error('Erro ao obter tipo de usuário:', err);
          return res.status(500).send('Erro interno do servidor');
        }

        if (results.length > 0) {
          const tipoUsuario = results[0].tipo;
          const isLoggedIn = req.session.isAuth;
          res.json({ tipoUsuario, isLoggedIn });
        } else {
          res.status(404).send('Usuário não encontrado');
        }
      });
    } else if (req.session.profileData) {
      userId = req.session.idxbox;
      const sql = 'SELECT u.id_usu, ux.imagem_url FROM usuario_xbox ux inner join usuario u on u.id_usu_xbox = ux.id_usu_xbox WHERE ux.id_usu_xbox = ?';
      connection.query(sql, [userId], (err, results) => {
        if (err) {
          console.error('Erro ao obter tipo de usuário:', err);
          return res.status(500).send('Erro interno do servidor');
        }

        const imgpath = results[0].imagem_url;
        const idUsu = results[0].id_usu;
        const tipoUsuario = req.session.userType; // se eu atualizar o tipo de usuário no servidor enquanto a sessão está on, não vai atualizar por causa disso, o recomendado é fazer uma pesquisa no bd
        const isLoggedIn = req.session.isAuth;
        return res.json({ tipoUsuario, isLoggedIn, imgpath, idUsu });
      });


    } else {
      return res.status(401).json({ isLoggedIn: false, redirect: '/login.html' });
    }
  } catch (error) {
    console.error('Erro ao obter tipo de usuário e status de login:', error);
    res.status(500).send('Erro interno do servidor');
  }
});

app.delete('/excluir-artigo/:artigoId', (req, res) => {
  console.log('Recebi uma requisição DELETE para /excluir-artigo/' + req.params.artigoId);
  const artigoId = req.params.artigoId;

  if (!req.session.user && !req.session.profileData) return res.status(401).json({ error: 'Usuário não autenticado' });

  const selectImageURLQuery = 'SELECT imagem_url FROM artigo WHERE id_artigo = ?';
  const countImageURLQuery = 'SELECT COUNT(*) AS count FROM artigo WHERE imagem_url = ?';

  connection.query(selectImageURLQuery, [artigoId], (err, imageResult) => {
    if (err) {
      console.error('Erro ao obter a URL da imagem:', err);
      return res.status(500).json({ error: 'Erro ao obter a URL da imagem' });
    }

    const imageUrl = imageResult[0]?.imagem_url;

    if (!imageUrl) return res.json({ message: 'Artigo não encontrado ou sem imagem associada' });

    connection.query(countImageURLQuery, [imageUrl], (err, countResult) => {
      if (err) {
        console.error('Erro ao contar a quantidade de imagens:', err);
        return res.status(500).json({ error: 'Erro ao contar a quantidade de imagens' });
      }

      const count = countResult[0]?.count || 0;

      const deleteMessage = count === 1 ? 'Artigo e imagens excluídos com sucesso' : 'Artigo excluído com sucesso';
      const deleteArtigoQuery = 'DELETE FROM artigo WHERE id_artigo = ?';

      connection.query(deleteArtigoQuery, [artigoId], (err) => {
        if (err) {
          console.error('Erro ao excluir o artigo:', err);
          return res.status(500).json({ error: 'Erro ao excluir o artigo' });
        }

        if (count === 1) {
          const imagePath = __dirname + '/images-preview/';
          const imageName = imageUrl.split('/').pop();
          const imageBaseName = imageName.split('.webp')[0];
          const variations = ['_720', '_432', '_firstchild'];

          fs.unlinkSync(`${imagePath}/${imageName}`);

          variations.forEach((variation) => {
            const variationImageName = `${imageBaseName}${variation}.webp`;
            fs.unlinkSync(`${imagePath}/${variationImageName}`);
          });
        }


        return res.json({ message: deleteMessage });
      });
    });
  });
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
          const resolutions = [
            { width: 860, height: 483, suffix: '_firstchild' },
            { width: 432, height: 243, suffix: '_432' },
            { width: 720, height: 405, suffix: '_720' }
          ];

          resolutions.forEach(({ width, height, suffix }) => {
            const uploadPath = `${__dirname}/images-preview/${newImageName.replace(/\.[^/.]+$/, "")}${suffix}.webp`;

            sharp(image.data)
              .resize(width, height)
              .webp({ quality: 100 })
              .toFile(uploadPath, (err) => {
                if (err) console.error(`Erro ao salvar imagem de resolução ${width}x${height}:`, err);
              });
          });

          // Após salvar todas as diferentes resoluções, realizar a atualização no banco de dados
          const sqlUpdate = 'UPDATE artigo SET titulo=?, imagem_url=?, previa_conteudo=?, conteudo=? WHERE id_artigo=?';
          const valuesUpdate = [title, newImageName, contentpreview, content, idArtigo];

          connection.query(sqlUpdate, valuesUpdate, (errorUpdate, resultsUpdate) => {
            if (errorUpdate) {
              console.error('Erro ao atualizar o artigo:', errorUpdate);
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

app.get('/verificar-permissao-editar-artigo/:artigoId', (req, res) => {
  const artigoId = req.params.artigoId;
  // const userIdFromSession = req.session.user.id_usu; // Obtém o ID do usuário da sessão
  let userId;
  // aqui é pra pegar o id do usuário da sessão
  if (req.session.user) {
    userId = req.session.user.id_usu;
  } else if (req.session.profileData) {
    userId = req.session.userId;
  } else {
    return res.status(401).json({ redirect: '/login.html' });
  }
  // Verificar se o usuário está autenticado (se a sessão está ativa)
  // Consultar o banco de dados para obter o ID do autor do artigo
  connection.query('SELECT id_usu FROM artigo WHERE id_artigo = ?', [artigoId], (err, results) => {
    if (err) {
      console.error('Erro ao verificar permissão de edição:', err);
      return res.status(500).json({ error: 'Erro ao verificar permissão de edição' });
    }

    const artigoAuthorId = results[0].id_usu;

    const isAdmin = req.session.userType === 'administrador';
    const isAuthor = userId === artigoAuthorId;
    const temPermissao = isAdmin || isAuthor;

    return res.json({
      temPermissao,
      ...(isAdmin && { isAdmin }), // chave json e variável
      ...(isAuthor && { isAuthor }) // chave json e variável
    });
  });
});

app.post('/insert-news', asyncHandler(async (req, res) => {
  const query = promisify(connection.query).bind(connection);
  const userId = req.session.user?.id_usu || req.session.userId;

  if (!userId) {
    return res.status(401).json({ redirect: '/login.html' });
  }

  const { title, contentpreview, content } = req.body;
  const image = req.files ? req.files.image : null;
  const missingFields = [];

  if (!title) missingFields.push('Título');
  if (!content) missingFields.push('Conteúdo');
  if (!image) missingFields.push('URL da imagem');
  if (!contentpreview) missingFields.push('Conteúdo da prévia');

  if (missingFields.length > 0) {
    const errorMessage = `Os seguintes campos devem ser preenchidos: ${missingFields.join(', ')}`;
    return res.status(400).json({ error: errorMessage });
  }

  const baseImageName = image.name.replace(/\.[^/.]+$/, "");
  const uploadPath = __dirname + '/images-preview/' + baseImageName + '.webp';

  try {
    await sharp(image.data)
      .resize(256, 144)
      .webp({ quality: 100 })
      .toFile(uploadPath);

    const newImageName = baseImageName + '.webp';
    const insertQuery = 'INSERT INTO artigo (titulo, conteudo, data_publicacao, id_usu, imagem_url, previa_conteudo, status) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const publicationDate = new Date();
    const status = 'Enviado'; // Definindo o status como 'Enviado'

    await query(insertQuery, [title, content, publicationDate, userId, newImageName, contentpreview, status]);

    const resolutions = [
      { width: 860, height: 483, suffix: '_firstchild' },
      { width: 432, height: 243, suffix: '_432' },
      { width: 720, height: 405, suffix: '_720' }
    ];

    await Promise.all(resolutions.map(async ({ width, height, suffix }) => {
      const resolutionPath = `${__dirname}/images-preview/${baseImageName}${suffix}.webp`;
      await sharp(image.data)
        .resize(width, height)
        .webp({ quality: 100 })
        .toFile(resolutionPath);
    }));

    res.status(200).json({ message: 'Artigo inserido com sucesso' });
  } catch (err) {
    console.error('Erro ao processar o artigo:', err);
    res.status(500).json({ error: 'Erro ao processar o artigo' });
  }
}));

app.get('/get-articles/:page', asyncHandler(async (req, res, next) => {
  const itemsPerPage = 8;
  const currentPage = parseInt(req.params.page, 10) || 1;

  if (currentPage < 1) return res.status(400).json({ error: 'Página inválida' });

  const statusFilter = req.session.userType === 'administrador' ? { 'reprovado': 'reprovado', 'analise': 'analise', 'enviado': 'enviado' }[req.query.status] || 'aprovado' : 'aprovado';

  const query = promisify(connection.query).bind(connection);

  try {
    const [articles, [{ enviado, em_analise, aprovado }]] = await Promise.all([
      query(`
        SELECT a.id_artigo, a.titulo, DATE_FORMAT(a.data_publicacao, '%d/%m/%Y %H:%i') AS data_formatada, a.id_usu, a.imagem_url, a.previa_conteudo, IFNULL(u.login_usu, ux.gamertag) AS login_usu
        FROM artigo a
        INNER JOIN usuario u ON a.id_usu = u.id_usu 
        LEFT JOIN usuario_xbox ux ON u.id_usu_xbox = ux.id_usu_xbox 
        WHERE a.status = ?
        ORDER BY data_publicacao DESC LIMIT ?, ?
      `, [statusFilter, (currentPage - 1) * itemsPerPage, itemsPerPage]),
      query(`
        SELECT SUM(status = 'enviado') AS enviado, SUM(status = 'em analise') AS em_analise, SUM(status = 'aprovado') AS aprovado, SUM(status = 'reprovado') AS reprovado
        FROM artigo
      `)
    ]);

    const totalCount = { enviado, em_analise, aprovado }[statusFilter] || 0;
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    res.json({ articles, counts: { enviado, em_analise, aprovado }, totalPages });
  } catch (error) {
    next(error);
  }
}));

app.get('/get-articles-profile', asyncHandler(async (req, res, next) => {
  const userId = parseInt(req.query.id) || (req.session.user && req.session.user.id_usu) || (req.session.profileData && req.session.userId);

  if (isNaN(userId) || userId < 1) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  const selectUserQuery = `
      SELECT IFNULL(u.login_usu, ux.gamertag) AS login_usu,
             IFNULL(u.descricao, "") AS descricao,
             IFNULL(u.imagem_url, ux.imagem_url) AS imagem_url,
             IFNULL(ux.gamerscore, 0) AS gamerscore
      FROM usuario u
      LEFT JOIN usuario_xbox ux ON u.id_usu_xbox = ux.id_usu_xbox
      WHERE u.id_usu = ?;
  `;

  const query = promisify(connection.query).bind(connection);
  const userResult = await query(selectUserQuery, [userId]);

  if (userResult.length === 0) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  const user = userResult[0];

  const itemsPerPage = 8;
  const currentPage = parseInt(req.query.page) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;

  const loggedUserId = req.session.user ? req.session.user.id_usu : req.session.userId;
  const viewingOwnProfile = userId === loggedUserId;

  const countQuery = viewingOwnProfile
    ? `
      SELECT COUNT(*) AS total_count 
      FROM artigo
      WHERE artigo.id_usu = ?;
    `
    : `
      SELECT COUNT(*) AS total_count 
      FROM artigo
      WHERE artigo.id_usu = ? AND artigo.status = 'aprovado';
    `;

  const articlesQuery = `
      SELECT 
          artigo.id_artigo, artigo.titulo, DATE_FORMAT(artigo.data_publicacao, '%d/%m/%Y %H:%i') AS data_formatada, artigo.id_usu, artigo.imagem_url, artigo.previa_conteudo, 
          IFNULL(usuario.login_usu, ux.gamertag) AS login_usu
      FROM artigo
      LEFT JOIN usuario ON artigo.id_usu = usuario.id_usu
      LEFT JOIN usuario_xbox ux ON ux.id_usu_xbox = usuario.id_usu_xbox
      WHERE artigo.id_usu = ? ${viewingOwnProfile ? "" : "AND artigo.status = 'aprovado'"}
      ORDER BY artigo.data_publicacao DESC LIMIT ?, ?;
  `;

  const [countResults, articles] = await Promise.all([
    query(countQuery, [userId]),
    query(articlesQuery, [userId, startIndex, itemsPerPage])
  ]);

  const totalCount = countResults[0].total_count;
  const hasNextPage = articles.length === itemsPerPage;

  res.json({ user, articles, totalCount, hasNextPage });
}));

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

    if (results.length === 0) return res.status(404).json({ error: 'Artigo não encontrado' });

    const article = results[0];
    res.json(article);
  });
});

// Rota para fazer logout
app.get('/logout', (req, res) => {
  // Revogue o token de acesso na Microsoft
  const microsoftAccessToken = client.getAccessToken();

  if (microsoftAccessToken) {
    // Chame a função de revogação do token de acesso, se disponível
    req.session.authData = null;
    client.clearTokens();
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

app.put('/update-description/:id?', asyncHandler(async (req, res) => {
  const newDescription = req.body.description;
  let userId = parseInt(req.params.id);

  // Se o ID na URL for inválido ou não existir, use o ID do usuário na sessão
  if (isNaN(userId) || userId < 1) { userId = req.session.user ? req.session.user.id_usu : req.session.userId; }

  if (!userId) { return res.status(400).json({ error: 'ID de usuário inválido ou não encontrado' }); }

  const loggedUserId = req.session.user ? req.session.user.id_usu : req.session.userId;

  if (loggedUserId !== userId) { return res.status(403).json({ error: 'Você não tem permissão para editar esta descrição' }); }

  const query = promisify(connection.query).bind(connection);
  const sql = 'UPDATE usuario SET descricao = ? WHERE id_usu = ?';
  const result = await query(sql, [newDescription, userId]);

  return result.affectedRows === 1
    ? res.json({ success: true })
    : res.status(500).json({ error: 'Nenhuma linha foi afetada' });
}));

// Rota para alterar o status do artigo
app.put('/alterar-status-artigo/:id', async (req, res) => {  /// FALHA DE SEGURANÇA AQUI, JÁ QUE NÃO É VERIFICADO SE O AUTOR É O DONO OU SE O USUÁRIO É ADM
  const articleId = req.params.id;
  const newStatus = req.body.status;

  if (req.session.isAuth) {
    // O usuário é administrador, permitir a atualização do status do artigo
    connection.query(
      'UPDATE artigo SET status = ? WHERE id_artigo = ?',
      [newStatus, articleId],
      (err, result) => {
        if (err) {
          console.error('Erro ao atualizar o status do artigo:', err);
          return res.status(500).json({ error: 'Erro interno do servidor' });
        }

        // Verificar se a atualização foi bem-sucedida
        if (result.affectedRows > 0) {
          res.status(200).json({ message: `Status do artigo ${articleId} alterado para ${newStatus}` });
        } else {
          res.status(404).json({ error: 'Artigo não encontrado ou status não alterado.' });
        }
      }
    );
  }

});

// Rota de autenticação
app.get('/auth', (req, res) => {
  if (req.session.authData) { return res.send('User already authenticated.'); }

  // Iniciar o servidor de autenticação e salvar os dados de autenticação na sessão do usuário
  const url = client.startAuthServer(() => {
    req.session.authData = client._authentication;
  });

  res.redirect(url);
});

app.get('/profile', asyncHandler(async (req, res) => {
  await client.isAuthenticated();
  const result = await client.getProvider('profile').getUserProfile();
  req.session.isAuth = true;
  req.session.profileData = result;

  const data = req.session.profileData;
  const userGamertag = data.profileUsers[0].settings.find(setting => setting.id === 'Gamertag').value;
  const userGamerscore = data.profileUsers[0].settings.find(setting => setting.id === 'Gamerscore').value;
  const id = result.profileUsers[0].id;
  req.session.idxbox = result.profileUsers[0].id;

  // Faz o download da imagem do perfil
  const profileImageURL = data.profileUsers[0].settings.find(setting => setting.id === 'GameDisplayPicRaw').value;
  const imagePath = __dirname + '/profile-xbox-images/' + id + '.webp';

  const downloadImage = new Promise((resolve, reject) => {
    https.get(profileImageURL, (response) => {
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
                reject(err);
                return;
              }
              resolve(id + '.webp');
            });
        });
    }).on('error', (error) => {
      console.error('Erro ao fazer o download da imagem do perfil:', error);
      reject(error);
    });
  });

  const newImageName = await downloadImage;

  // Insere a imagem redimensionada e convertida no banco de dados
  const insertImageQuery = `
    INSERT INTO usuario_xbox (id_usu_xbox, gamertag, gamerscore, imagem_url) 
    VALUES (?, ?, ?, ?) 
    ON DUPLICATE KEY UPDATE 
    gamertag = VALUES(gamertag), 
    gamerscore = VALUES(gamerscore), 
    imagem_url = VALUES(imagem_url);
  `;

  await promisify(connection.query).bind(connection)(insertImageQuery, [id, userGamertag, userGamerscore, newImageName]);

  // Recupera o ID do usuário e o tipo do usuário
  const getUserQuery = 'SELECT id_usu, tipo FROM usuario WHERE id_usu_xbox = ?';
  const userResult = await promisify(connection.query).bind(connection)(getUserQuery, [id]);

  if (userResult.length > 0) {
    req.session.userId = userResult[0].id_usu; //errei em usar o req.session.userid em outros lugares, substituir por "".idxbox
    req.session.userType = userResult[0].tipo;
    res.redirect('/noticias');
  } else {
    console.error('Usuário não encontrado após inserção/atualização.');
    res.status(500).json({ error: 'Usuário não encontrado' });
  }
}));

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

// Middleware de Tratamento de Erros Global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno no servidor' });
});



// Middleware para capturar 404 - Página não encontrada
app.use((req, res, next) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});



const options = {
  key: fs.readFileSync('server.key'), // Caminho para sua chave privada
  cert: fs.readFileSync('server.cert') // Caminho para seu certificado SSL
};


const server = https.createServer(options, app);

server.listen(port, () => {
  console.log(`Servidor HTTPS rodando em https://localhost:${port}/info`);
});
