import { updateLoginButtonVisibility } from './auth.js';

updateLoginButtonVisibility();

const articleContainer = document.querySelector('.article-container');
const paginationContainer = document.querySelector('.pagination-container');

window.addEventListener('resize', handleImageResolution);

function handleImageResolution() {
  const screenWidth = window.innerWidth;
  const images = document.querySelectorAll('.article img');

  images.forEach((image, index) => {
    const originalSrc = image.dataset.originalSrc; // Salvando o URL original em um atributo 'data'
    if (screenWidth > 1199) {
      
      (index === 0)? image.src = originalSrc.replace('.webp', '_firstchild.webp'):  image.src = originalSrc.replace('_firstchild.webp', '.webp'); 

    } else if (screenWidth >= 992 && screenWidth <= 1199) {
      image.src = originalSrc.replace('.webp', '_firstchild.webp');
    } else if (screenWidth > 320 && screenWidth <= 480) {
      // Lógica para telas menores ou iguais a 480px
      image.src = originalSrc.replace('.webp', '_432.webp');
      image.onerror = function () {
        image.src = originalSrc;
      };
    } else if (screenWidth > 480 && screenWidth <= 768) {
      // Lógica para telas menores ou iguais a 768px
      image.src = originalSrc.replace('.webp', '_720.webp');
      image.onerror = function () {
        image.src = originalSrc;
      };
    } else if (screenWidth <= 320) {
      // Lógica para telas menores ou iguais a 768px
      image.src = originalSrc.replace('_firstchild.webp', '.webp');
    }
  });
}

class Article {
  constructor(id_artigo, titulo, data_formatada, id_usu, imagem_url, previa_conteudo, login_usu) {
    Object.assign(this, { id_artigo, titulo, data_formatada, id_usu, imagem_url, previa_conteudo, login_usu });
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
    userInfoElement.textContent = `Postado por ${this.login_usu} em ${this.data_formatada}`;

    [imageElement, titleElement, previewElement, userInfoElement].forEach(elem => articleElement.appendChild(elem));

    return articleElement;
  }
}

function getCurrentPageFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const pageParam = urlParams.get('page');
  // Validação básica para garantir que o parâmetro 'page' seja um número inteiro positivo
  if (pageParam && /^\d+$/.test(pageParam)) {
    const parsedPage = parseInt(pageParam, 10);
    return parsedPage > 0 ? parsedPage : 1; // Retorna o valor convertido se for um número positivo, senão retorna 1
  }
  return 1; // Retorna 1 se nenhum parâmetro de página válido for fornecido
}

let currentPage = getCurrentPageFromURL();

function updatePageNumbers(totalPages) {
  const pageNumbersContainer = document.querySelector('.page-numbers');
  pageNumbersContainer.innerHTML = ''; // Limpar os números de página existentes

  const maxPageIndices = 8; // Quantidade máxima de índices de página exibidos
  const halfMaxIndices = Math.floor(maxPageIndices / 2);

  let startPage = currentPage - halfMaxIndices;
  let endPage = currentPage + halfMaxIndices;

  startPage = startPage <= 0 ? 1 : startPage;
  endPage = startPage <= 0 ? Math.min(maxPageIndices, totalPages) : endPage;

  endPage = endPage > totalPages ? totalPages : endPage;
  startPage = endPage > totalPages ? Math.max(1, totalPages - maxPageIndices + 1) : startPage;

  for (let i = startPage; i <= endPage; i++) {
    const pageLink = document.createElement('a');
    pageLink.href = `not%C3%ADcias.html?page=${i}`;
    pageLink.textContent = i;
    pageLink.classList.toggle('active', i === currentPage);
    pageLink.addEventListener('click', loadArticles.bind(null, i));
    pageNumbersContainer.appendChild(pageLink);
  }

  const paginationContainer = document.querySelector('.pagination-container');
  const prevPageButton = paginationContainer.querySelector('.prev-page');
  const nextPageButton = paginationContainer.querySelector('.next-page');
  prevPageButton.addEventListener('click', handlePageButtonClick(-1, totalPages));
  nextPageButton.addEventListener('click', handlePageButtonClick(1, totalPages));
  prevPageButton.style.display = currentPage > 1 ? 'block' : 'none';
  nextPageButton.style.display = currentPage < totalPages ? 'block' : 'none';
}

async function fetchArticles(pageNumber) {
  try {
    let itemsPerPage = 8
    const response = await fetch(`/get-articles/${pageNumber}`);
    const data = await response.json();
    return { articles: data.articles, totalPages: Math.ceil(data.totalCount / itemsPerPage) };
  } catch (error) {
    console.error('Error fetching articles:', error);
    return { articles: [], totalPages: 0 };
  }
}

async function loadArticles(pageNumber) {
  const { articles: newArticles, totalPages: newTotalPages } = await fetchArticles(pageNumber);
  const fragment = document.createDocumentFragment();

  for (const article of newArticles) {
    const { id_artigo, titulo, data_formatada, id_usu, imagem_url, previa_conteudo, login_usu } = article;
    const articleInstance = new Article(id_artigo, titulo, data_formatada, id_usu, imagem_url, previa_conteudo, login_usu);
    fragment.appendChild(await articleInstance.render());
  }
 
  articleContainer.innerHTML = '';
  articleContainer.appendChild(fragment);

  handleImageResolution();
  currentPage = pageNumber;
  updatePageNumbers(newTotalPages);
  window.history.pushState({}, '', `not%C3%ADcias.html?page=${pageNumber}`);
  paginationContainer.style.display = 'block';
}

const handlePageButtonClick = (offset, totalPages) => async (event) => {
  const nextPage = currentPage + offset;
  (nextPage >= 1 && nextPage <= totalPages) && await loadArticles(nextPage);
};

function openArticle(id) {
  window.location.href = `artigo.html?id=${id}`;
}

loadArticles(currentPage);




