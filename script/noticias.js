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
    this.id_artigo = id_artigo;
    this.conteudo = conteudo;
    this.titulo = titulo;
    this.previa_conteudo = previa_conteudo;
    this.data_publicacao = data_publicacao;
    this.id_usu = id_usu;
    this.imagem_url = imagem_url;
    this.login_usu = login_usu;
  }

  async render(index) {
    const articleElement = document.createElement('div');
    articleElement.classList.add('article');
    articleElement.setAttribute('data-id', this.id_artigo);
    const imageElement = document.createElement('img');
    imageElement.alt = this.titulo;


    imageElement.setAttribute('width', '860');
    imageElement.setAttribute('height', '483');
    
    
   
    if (index === 0) {
     
      imageElement.src = this.imagem_url.replace('.webp', '_firstchild.webp');
      imageElement.dataset.originalSrc = this.imagem_url;

    } else {
      imageElement.src = this.imagem_url;
      imageElement.dataset.originalSrc = this.imagem_url;
    }


      // Define estilos para a imagem
      //imageElement.style.width = '100%';
      //imageElement.style.height = 'auto';


    const titleElement = document.createElement('h1');
    titleElement.textContent = this.titulo;


    const openArticleHandler = () => {
      openArticle(this.id_artigo);
    };

    imageElement.addEventListener('click', openArticleHandler);
    titleElement.addEventListener('click', openArticleHandler);

    const previewElement = document.createElement('p');
    previewElement.textContent = this.previa_conteudo;

    const userName = this.login_usu;
    const userInfoElement = document.createElement('p2');
    userInfoElement.textContent = `Postado por ${userName} em ${formatDate(this.data_publicacao)}`;

    articleElement.appendChild(imageElement);
    articleElement.appendChild(titleElement);
    articleElement.appendChild(previewElement);
    articleElement.appendChild(userInfoElement);

    return articleElement;
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

  



}

function handlePageButtonClick(offset) {
  return function(event) {
    event.preventDefault();
    const nextPage = currentPage + offset;
    if (nextPage >= 1 && nextPage <= totalPages) {
      loadArticles(nextPage);
    }
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



