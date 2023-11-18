import { updateLoginButtonVisibility } from './auth.js';

updateLoginButtonVisibility();

const articleContainer = document.querySelector('.article-container');

window.addEventListener('resize', handleImageResolution);

function handleImageResolution() {
  const screenWidth = window.innerWidth;
  const images = document.querySelectorAll('.article img');

  images.forEach((image, index) => {
    const originalSrc = image.dataset.originalSrc; // Salvando o URL original em um atributo 'data'

    if (screenWidth > 1199) {

      if (index === 0) {
        image.src = originalSrc.replace('.webp', '_firstchild.webp');
      } else {
        image.src = originalSrc.replace('_firstchild.webp', '.webp');
      }
    } else if (screenWidth >= 992 && screenWidth <= 1199) {
      image.src = originalSrc.replace('.webp', '_firstchild.webp');
      
    
    }
  });
}

class Article {
  constructor(id_artigo, titulo, conteudo, data_publicacao, id_usu, imagem_url, previa_conteudo, login_usu) {
    Object.assign(this, { id_artigo, titulo, conteudo, data_publicacao, id_usu, imagem_url, previa_conteudo, login_usu });
  }

  async render(index) {
    const articleElement = document.createElement('div');
    articleElement.classList.add('article');
    articleElement.setAttribute('data-id', this.id_artigo);

    const imageElement = document.createElement('img');
    imageElement.alt = this.titulo;
    imageElement.width = '860';
    imageElement.height = '483';
    const originalSrc = this.imagem_url;
    const newSrc = (index === 0 ? originalSrc.replace('.webp', '_firstchild.webp') : originalSrc);
    imageElement.src = newSrc;
    imageElement.dataset.originalSrc = originalSrc;

    const titleElement = document.createElement('h1');
    titleElement.textContent = this.titulo;

    const openArticleHandler = () => openArticle(this.id_artigo);
    imageElement.addEventListener('click', openArticleHandler);
    titleElement.addEventListener('click', openArticleHandler);

    const previewElement = document.createElement('p');
    previewElement.textContent = this.previa_conteudo;

    const userInfoElement = document.createElement('p2');
    userInfoElement.textContent = `Postado por ${this.login_usu} em ${formatDate(this.data_publicacao)}`;

    [imageElement, titleElement, previewElement, userInfoElement].forEach(elem => articleElement.appendChild(elem));

    return articleElement;
  }
}

function formatDate(dateString) {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', options);
}

// Obtém o número da página da URL
function getCurrentPageFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const pageParam = urlParams.get('page');
  return pageParam ? parseInt(pageParam) : 1; // Retorna 1 se nenhum parâmetro de página for fornecido
}

const articles = [];
// No início do código, atualize a variável currentPage
let currentPage = getCurrentPageFromURL();
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
    pageLink.href = `not%C3%ADcias.html?page=${i}`;
    pageLink.textContent = i;

    if (i === currentPage) {
      pageLink.classList.add('active');
    }

    pageLink.addEventListener('click', (event) => {
      event.preventDefault();
      loadArticles(i);
    });

    pageNumbersContainer.appendChild(pageLink);
  }

  const paginationContainer = document.querySelector('.pagination-container');
  const prevPageButton = paginationContainer.querySelector('.prev-page');
  const nextPageButton = paginationContainer.querySelector('.next-page');

  prevPageButton.style.display = currentPage > 1 ? 'block' : 'none';
  nextPageButton.style.display = currentPage < totalPages ? 'block' : 'none';
}

async function fetchAndAppendArticles(pageNumber) {
  try {
    const response = await fetch(`/get-articles/${pageNumber}`); // Alterando para passar o número da página como parte da URL
    const data = await response.json();
    const newArticles = data.articles;
    articles.push(...newArticles);
  } catch (error) {
    console.error('Error fetching and appending articles:', error);
  }
}

function clearArticleContainer() { 
  articleContainer.innerHTML = '';
  articles.length = 0;
}

async function loadArticles(pageNumber) {
  clearArticleContainer();
  await fetchAndAppendArticles(pageNumber);

  for (let i = 0; i < articles.length; i++) {
    const { id_artigo, titulo, conteudo, data_publicacao, id_usu, imagem_url, previa_conteudo,login_usu } = articles[i];
    const article = new Article(id_artigo, titulo, conteudo, data_publicacao, id_usu, imagem_url, previa_conteudo, login_usu);
    articleContainer.appendChild(await article.render(i)); // Passando o índice para o método render()
  }
  handleImageResolution();
  currentPage = pageNumber;
  updatePageNumbers(totalPages);
  window.history.pushState({}, '', `not%C3%ADcias.html?page=${pageNumber}`);
  const paginationContainer = document.querySelector('.pagination-container');
  paginationContainer.style.display = 'block'; 
}

function handlePageButtonClick(offset) {
  return function(event) {
    event.preventDefault();
    const nextPage = currentPage + offset;
   (nextPage >= 1 && nextPage <= totalPages) ? loadArticles(nextPage):undefined;
  };
}

const prevPageButton = document.querySelector('.prev-page');
const nextPageButton = document.querySelector('.next-page');
prevPageButton.addEventListener('click', handlePageButtonClick(-1));
nextPageButton.addEventListener('click', handlePageButtonClick(1));

function openArticle(id) {
  window.location.href = `artigo.html?id=${id}`;
}

fetchTotalArticleCount().then(() => {
  updatePageNumbers(totalPages);
  loadArticles(currentPage); 
});



