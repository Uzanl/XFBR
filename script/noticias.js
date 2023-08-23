import { updateLoginButtonVisibility } from './auth.js';



// Chamar a função para atualizar a visibilidade do botão de login ao carregar a página
updateLoginButtonVisibility();





class Article {
  constructor(id_artigo,titulo,conteudo,data_publicacao,id_usu,imagem_url,previa_conteudo) {
    this.id_artigo = id_artigo;
    this.conteudo = conteudo;
    this.titulo = titulo;
    this.previa_conteudo = previa_conteudo;
    this.data_publicacao = data_publicacao;
    this.id_usu = id_usu;
    this.imagem_url = imagem_url;
  }

  async render() {
    const articleElement = document.createElement('div');
    articleElement.classList.add('article');
    articleElement.setAttribute('data-id', this.id_artigo);

    const imageElement = document.createElement('img');
    imageElement.src = this.imagem_url;
    imageElement.alt = this.titulo;
    imageElement.addEventListener('click', () => {
      openArticle(this.id_artigo);
    });

    const titleElement = document.createElement('h1');
    titleElement.textContent = this.titulo;
    titleElement.addEventListener('click', () => {
      openArticle(this.id_artigo);
    });

    const previewElement = document.createElement('p');
    previewElement.textContent = this.previa_conteudo;

    const userName = await getUserName(this.id_usu);
    const userInfoElement = document.createElement('p');
    userInfoElement.textContent = `Postado por ${userName} em ${formatDate(this.data_publicacao)}`;

    articleElement.appendChild(imageElement);
    articleElement.appendChild(titleElement);
    articleElement.appendChild(previewElement);
    articleElement.appendChild(userInfoElement);

    return articleElement;
  }
}


async function getUserName(userId) {
  //console.log(userId);
  try {
    const response = await fetch(`/get-username/${userId}`);
    if (response.ok) {
      const data = await response.json();
      return data.username;
    } else {
      throw new Error('Erro ao obter nome de usuário');
    }
  } catch (error) {
    console.error('Erro ao obter nome de usuário:', error);
    return "Nome de Usuário Desconhecido"; // Em caso de erro ou falta de resposta
  }
}


function formatDate(dateString) {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', options);
}

const articles = [];
let currentPage = 1;
let itemsPerPage = 8;
let totalPages = 0;

async function fetchTotalArticleCount() {
  try {
    const response = await fetch('/get-article-count'); // Endpoint para obter a contagem total de artigos
    const data = await response.json();
    totalPages = Math.ceil(data.count / itemsPerPage); // Calcular o número total de páginas
    //console.log(totalPages);
  } catch (error) {
    console.error('Error fetching total article count:', error);
  }
}





function updatePageNumbers(totalPages) {
  const pageNumbersContainer = document.querySelector('.page-numbers');
  pageNumbersContainer.innerHTML = ''; // Limpar os números de página existentes

  const maxPageIndices = 8; // Quantidade máxima de índices de página exibidos
  const halfMaxIndices = Math.floor(maxPageIndices / 2);

  let startPage = currentPage - halfMaxIndices;
  let endPage = currentPage + halfMaxIndices;

  if (startPage <= 0) {
    startPage = 1;
    endPage = Math.min(maxPageIndices, totalPages);
  }

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, totalPages - maxPageIndices + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    const pageLink = document.createElement('a');
    pageLink.href = '#';
    pageLink.textContent = i;

    if (i === currentPage) {
      pageLink.classList.add('active'); // Adicionar a classe 'active' diretamente aqui
    }

    pageLink.addEventListener('click', () => {
      loadArticles(i);
    });

    pageNumbersContainer.appendChild(pageLink);
  }

  const paginationContainer = document.querySelector('.pagination-container');
  const prevPageButton = paginationContainer.querySelector('.prev-page');
  const nextPageButton = paginationContainer.querySelector('.next-page');

  if (currentPage > 1) {
    prevPageButton.style.display = 'block';
  } else {
    prevPageButton.style.display = 'none';
  }

  if (currentPage < totalPages) {
    nextPageButton.style.display = 'block';
  } else {
    nextPageButton.style.display = 'none';
  }

  if(currentPage== totalPages){
    console.log("teste");
  }
}

async function fetchAndAppendArticles(pageNumber) {
  try {
    const response = await fetch(`/get-articles?page=${pageNumber}`);
    const data = await response.json();
    const newArticles = data.articles;
    articles.push(...newArticles);
  } catch (error) {
    console.error('Error fetching and appending articles:', error);
  }
}

function clearArticleContainer() {
  const articleContainer = document.querySelector('.article-container');
  articleContainer.innerHTML = '';
  articles.length = 0;
}

async function loadArticles(pageNumber) {
  clearArticleContainer();
  await fetchAndAppendArticles(pageNumber);

  const articleContainer = document.querySelector('.article-container');

  for (const articleData of articles) {
    const { id_artigo, titulo, conteudo, data_publicacao, id_usu, imagem_url, previa_conteudo } = articleData;
    const article = new Article(id_artigo, titulo, conteudo, data_publicacao, id_usu, imagem_url, previa_conteudo);
    articleContainer.appendChild(await article.render());
  }

  currentPage = pageNumber;
  updatePageNumbers(totalPages);
}




// Captura o número da página ao clicar nos botões "Anterior" e "Próximo"
const prevPageButton = document.querySelector('.prev-page');
const nextPageButton = document.querySelector('.next-page');

prevPageButton.addEventListener('click', event => {
  event.preventDefault();
  if (currentPage > 1) {
    loadArticles(currentPage - 1);
  }
});

nextPageButton.addEventListener('click', event => {
  event.preventDefault();
  if (currentPage < totalPages) {
    loadArticles(currentPage + 1);
  }
});

function openArticle(id) {
  window.location.href = `artigo.html?id=${id}`;
}


fetchTotalArticleCount().then(() => {
  updatePageNumbers(totalPages);
  loadArticles(currentPage);
});



