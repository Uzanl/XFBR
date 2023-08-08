import { updateLoginButtonVisibility } from './auth.js';

// Chamar a função para atualizar a visibilidade do botão de login ao carregar a página
updateLoginButtonVisibility();

function toggleSidebar() {
  var sidebar = document.getElementById('sidebar');
  var toggleBtn = document.querySelector('.toggle-btn');

  sidebar.classList.toggle('active');
  toggleBtn.classList.toggle('active');
}

class Article {
  constructor(id, content, data_publicacao) {
    this.id = id;
    this.content = content;
    this.data_publicacao = data_publicacao;
  }

  render() {
    const articleElement = document.createElement('div');
    articleElement.classList.add('article');
    articleElement.setAttribute('data-id', this.id);
    articleElement.addEventListener('click', () => {
      openArticle(this.id);
    });

    const contentElement = document.createElement('div'); // Use div instead of p
    contentElement.innerHTML = this.content; // Use innerHTML to render HTML content

    const dateElement = document.createElement('p');
    dateElement.textContent = this.data_publicacao; // Use date from data_publicacao

    articleElement.appendChild(contentElement);
    articleElement.appendChild(dateElement);

    return articleElement;
  }
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
    console.log(totalPages);
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

  articles.forEach(articleData => {
    const { id_artigo, conteudo, data_publicacao } = articleData;
    const article = new Article(id_artigo, conteudo, data_publicacao);
    const articleContainer = document.querySelector('.article-container');
    articleContainer.appendChild(article.render());
  });

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
// ... Resto do código ...

function openArticle(id) {
  window.location.href = `artigo.html?id=${id}`;
}

fetchTotalArticleCount().then(() => {
  updatePageNumbers(totalPages);
  loadArticles(currentPage);
});



