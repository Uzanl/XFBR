

const articleContainer = document.querySelector('.article-container');
const paginationContainer = document.querySelector('.pagination-container');

class Article {
  constructor(id_artigo, titulo, data_publicacao, id_usu, imagem_url, previa_conteudo, login_usu) {
    Object.assign(this, { id_artigo, titulo, data_publicacao, id_usu, imagem_url, previa_conteudo, login_usu });
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

let currentPage = 1;

function updatePageNumbers(totalPages) {
  const pageNumbersContainer = document.querySelector('.page-numbers');
  pageNumbersContainer.innerHTML = '';

  const maxPageIndices = 8;
  const halfMaxIndices = Math.floor(maxPageIndices / 2);

  let startPage = currentPage - halfMaxIndices;
  let endPage = currentPage + halfMaxIndices;

  startPage = startPage <= 0 ? 1 : startPage;
  endPage = startPage <= 0 ? Math.min(maxPageIndices, totalPages) : endPage;

  endPage = endPage > totalPages ? totalPages : endPage;
  startPage = endPage > totalPages ? Math.max(1, totalPages - maxPageIndices + 1) : startPage;

  const fragment = document.createDocumentFragment();

  
  for (let i = startPage; i <= endPage; i++) {
    const pageLink = document.createElement('a');
    pageLink.textContent = i;
    pageLink.classList.toggle('active', i === currentPage);
    /*pageLink.addEventListener('click', () => loadArticles(i));*/
    fragment.appendChild(pageLink);
  }

  const prevPageButton = paginationContainer.querySelector('.prev-page');
  const nextPageButton = paginationContainer.querySelector('.next-page');

  paginationContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('page-link')) {
      const pageNumber = parseInt(event.target.textContent);
      loadArticles(pageNumber);
    } else if (event.target.classList.contains('prev-page')) {
      handlePageButtonClick(-1, totalPages)();
    } else if (event.target.classList.contains('next-page')) {
      handlePageButtonClick(1, totalPages)();
    }
  });
  
 /* prevPageButton.addEventListener('click', handlePageButtonClick(-1, totalPages));
  nextPageButton.addEventListener('click', handlePageButtonClick(1, totalPages));*/
    
  prevPageButton.style.display = currentPage > 1 ? 'block' : 'none';
  nextPageButton.style.display = currentPage < totalPages ? 'block' : 'none';

  pageNumbersContainer.appendChild(fragment);
}

const handlePageButtonClick = (offset, totalPages) => async () => {
  const nextPage = currentPage + offset;
  if (nextPage >= 1 && nextPage <= totalPages) {
    await loadArticles(nextPage);
  }
};

async function fetchArticles(pageNumber) {
  try {
     // Obtém o ID dos parâmetros da URL

    let itemsPerPage = 8;
    const response = await fetch(`/get-articles-profile?page=${pageNumber}`); // Adiciona o ID à URL
    const data = await response.json();

    return { articles: data.articles, totalPages: Math.ceil(data.totalCount / itemsPerPage) };
    
  } catch (error) {
    console.error('Error fetching articles:', error);
    return { articles: [], totalPages: 0 };
  }
}

async function loadArticles(pageNumber) {
  const { articles: newArticles, totalPages: newTotalPages } = await fetchArticles(pageNumber);
  articleContainer.innerHTML = '';

  for (const article of newArticles) {
    const { id_artigo, titulo, data_publicacao, id_usu, imagem_url, previa_conteudo, login_usu } = article;
    const articleInstance = new Article(id_artigo, titulo, data_publicacao, id_usu, imagem_url, previa_conteudo, login_usu);
    articleContainer.appendChild(await articleInstance.render());
  }

  currentPage = pageNumber;
  updatePageNumbers(newTotalPages);
  paginationContainer.style.display = 'block';
}

function openArticle(id) {
  window.location.href = `artigo.html?id=${id}`;
}

async function GetPageData() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  LoadProfile(id)
  loadArticles(currentPage);
}

GetPageData();


async function LoadProfile(id) {
  try {
    const response = await fetch(`/get-user-info/${id}`, {
      method: 'GET',
      credentials: 'same-origin'
    });

    if (!response.ok) {
      throw new Error('Erro ao obter informações do usuário');
    }

    const data = await response.json();

    const descriptionParagraph = document.querySelector('.profile-description p');
    const profileImage = document.querySelector('.imagem-perfil');
    const gamertag = document.querySelector('.gamertag');
    const gamerscoreValue = document.querySelector('.gamerscore-value');
    const descProfile = document.querySelector('.desc-profile');
    const largeTextBox = document.getElementById('description-input');
    const BtnUpdateDescription = document.getElementById('update-description-button');
    const ImgEditIcon = document.querySelector('.image-edit-icon');

    if (data.gamertag) {
      gamertag.textContent = data.gamertag;
      gamerscoreValue.textContent = data.gamerscore;
      profileImage.src = data.imageUrl;
      descProfile.style.display = 'none';
      largeTextBox.style.display = 'none';
      BtnUpdateDescription.style.display = 'none';
      ImgEditIcon.style.display = 'none';
    } else {
      if (data.description) {
        descriptionParagraph.textContent = data.description;
      } else {
        descriptionParagraph.textContent = "Sua descrição atual do perfil está vazia. Atualize sua descrição.";
        descriptionParagraph.style.color = "red";
      }

      if (data.imageUrl) {
        profileImage.src = data.imageUrl;
      }
    }
  } catch (error) {
    console.error("Erro na solicitação de informações do usuário:", error);
  }
}

    


 



