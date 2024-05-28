const articleContainer = document.querySelector('.article-container');
const paginationContainer = document.querySelector('.pagination-container');
const textarea = document.querySelector('.desc-profile2');

window.addEventListener("resize", handleImageResolution);

function handleImageResolution() {
  const screenWidth = window.innerWidth;
  const images = document.querySelectorAll(".article img");

  images.forEach(function (image, index) {
    const originalSrc = image.dataset.originalSrc;
    if (screenWidth > 1199) {
      (index === 0) ? image.src = originalSrc.replace(".webp", "_firstchild.webp") : image.src = originalSrc.replace("_firstchild.webp", ".webp");

    } else if (screenWidth > 768 && screenWidth < 992) {
      image.src = originalSrc.replace(".webp", "_firstchild.webp");
    }
    else if (screenWidth >= 992 && screenWidth <= 1199) {
      image.src = originalSrc.replace(".webp", "_firstchild.webp");
    } else if (screenWidth > 320 && screenWidth <= 480) {
      image.src = originalSrc.replace(".webp", "_432.webp");
    } else if (screenWidth > 480 && screenWidth <= 768) {
      image.src = originalSrc.replace(".webp", "_720.webp");
    } else if (screenWidth <= 320) {
      image.src = originalSrc.replace("_firstchild.webp", ".webp");
    }
  });
}


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
      // Aqui precisamos obter o ID do perfil novamente
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id');
      loadProfile(pageNumber, id); // Corrigindo a chamada da função
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
    await loadProfile(nextPage);
  }
};

async function fetchProfileData(pageNumber, id) {
  try {
    const itemsPerPage = 8;
    const response = await fetch(`/get-articles-profile?page=${pageNumber}&id=${id}`);
    const data = await response.json();

    return {
      user: data.user,
      articles: data.articles,
      totalPages: Math.ceil(data.totalCount / itemsPerPage)
    };
  } catch (error) {
    console.error('Error fetching profile data:', error);
    return { user: null, articles: [], totalPages: 0 };
  }
}

async function loadProfile(pageNumber, id) {
  const { user, articles, totalPages } = await fetchProfileData(pageNumber, id);

  // Carregar informações do usuário
  if (user) {
    const descriptionParagraph = document.querySelector('.desc-profile2');
    const profileImage = document.querySelector('.imagem-perfil');
    const gamertag = document.querySelector('.gamertag');
    const gamerscoreValue = document.querySelector('.gamerscore-value');
    const descProfile = document.querySelector('.desc-profile');
    const ImgEditIcon = document.querySelector('.image-edit-icon');

    gamertag.textContent = user.login_usu;
    gamerscoreValue.textContent = user.gamerscore;
    profileImage.src = user.imagem_url || 'default_image_url'; // Substitua por uma URL de imagem padrão
    descProfile.style.display = 'none';
    ImgEditIcon.style.display = 'none';
    descriptionParagraph.textContent = user.descricao;

    descriptionParagraph.addEventListener('input', async (event) => {
      try {
        const newDescription = event.target.value;

        const updateResponse = await fetch(`/update-description/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ description: newDescription })
        });

        if (!updateResponse.ok) throw new Error('Erro ao atualizar a descrição do perfil');

        console.log('Descrição atualizada com sucesso:', newDescription);
      } catch (error) {
        console.error('Erro ao atualizar a descrição do perfil:', error);
      }
    });

    descriptionParagraph.parentElement.addEventListener('click', () => {
      descriptionParagraph.removeAttribute('readonly');
    });
  }

  // Carregar artigos
  const articleContainer = document.querySelector('.article-container');
  articleContainer.innerHTML = '';

  for (const article of articles) {
    const { id_artigo, titulo, data_publicacao, id_usu, imagem_url, previa_conteudo, login_usu } = article;
    const articleInstance = new Article(id_artigo, titulo, data_publicacao, id_usu, imagem_url, previa_conteudo, login_usu);
    articleContainer.appendChild(await articleInstance.render());
  }

  currentPage = pageNumber;
  handleImageResolution();
  updatePageNumbers(totalPages);
  paginationContainer.style.display = 'block';
}

function openArticle(id) {
  window.location.href = `artigo.html?id=${id}`;
}

async function GetPageData() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  await loadProfile(currentPage, id);
}

GetPageData();

// Adiciona um ouvinte de evento de clique à div que contém a textarea
textarea.parentElement.addEventListener('click', () => {
  // Remove o atributo readonly quando clicar
  textarea.removeAttribute('readonly');
});









