const articleContainer = document.querySelector('.article-container');
const paginationContainer = document.querySelector('.pagination-container');
const textarea = document.querySelector('.desc-profile2');
const pageNumbersContainer = document.querySelector(".page-numbers");
const prevPageButton = paginationContainer.querySelector(".prev-page");
const nextPageButton = paginationContainer.querySelector(".next-page");
const descriptionParagraph = document.querySelector('.desc-profile2');
const profileImage = document.querySelector('.imagem-perfil');
const gamertag = document.querySelector('.gamertag');
const gamerscoreValue = document.querySelector('.gamerscore-value');
const descProfile = document.querySelector('.desc-profile');
const ImgEditIcon = document.querySelector('.image-edit-icon');


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

  constructor(articleData) {
    Object.assign(this, articleData);
  }

  async render(index) {
    const originalSrc = this.imagem_url;
    const newSrc = index === 0 ? originalSrc.replace(".webp", "_firstchild.webp") : originalSrc;
    return `
      <div class="article" data-id="${this.id_artigo}" onclick="openArticle(${this.id_artigo})">
        <img src="${newSrc}" alt="${this.titulo}" width="860" height="483" data-original-src="${originalSrc}">
        <h1>${this.titulo}</h1>
        <p>${this.previa_conteudo}</p>
        <p2>Postado por ${this.login_usu} em ${this.data_formatada}</p2>
      </div>
      
    ` ;
  }
}

const getCurrentPageAndStatusFromURL = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const pageParam = urlParams.get("page");
  //  const statusParam = urlParams.get("status") || 'aprovado';
  const currentPage = pageParam && /^(?:\d)+$/.test(pageParam) ? Math.max(parseInt(pageParam, 10), 1) : 1;
  return { currentPage };
};

let { currentPage } = getCurrentPageAndStatusFromURL();

const updatePageNumbers = (totalPages,idParam) => {
  pageNumbersContainer.innerHTML = "";

  const maxPageIndices = 8;
  const halfMaxIndices = Math.floor(maxPageIndices / 2);
  let startPage = Math.max(1, currentPage - halfMaxIndices);
  let endPage = Math.min(totalPages, startPage + maxPageIndices - 1);

  if (endPage - startPage < maxPageIndices - 1) {
    startPage = Math.max(1, endPage - maxPageIndices + 1);
  }

  const fragment = new DocumentFragment();
  for (let i = startPage; i <= endPage; i++) {
    const pageLink = document.createElement("a");
    pageLink.href = `perfil?page=${i}&id=${idParam}`;
    pageLink.classList.add("page-link");
    pageLink.textContent = i;
    pageLink.classList.toggle("active", i === currentPage);
    fragment.appendChild(pageLink);
  }

  prevPageButton.href = `perfil?page=${Math.max(currentPage - 1, 1)}&id=${idParam}`;
  prevPageButton.style.display = currentPage > 1 ? "block" : "none";

  nextPageButton.href = `perfil?page=${Math.min(currentPage + 1, totalPages)}&id=${idParam}`;
  nextPageButton.style.display = currentPage < totalPages ? "block" : "none";

  pageNumbersContainer.appendChild(fragment);
};

paginationContainer.addEventListener("click", async (event) => {
  event.preventDefault();
  const params = new URLSearchParams(window.location.search);
  const idParam = params.get('id');
  if (event.target.classList.contains("page-link")) {
    const pageNumber = parseInt(event.target.textContent);
   
    await loadProfile(pageNumber, idParam);
  } else if (event.target.classList.contains("prev-page") || event.target.classList.contains("next-page")) {
    const pageParam = new URL(event.target.href).searchParams.get("page");
    const pageNumber = parseInt(pageParam);
    
    await loadProfile(pageNumber, idParam);
  }
});

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

  articleContainer.innerHTML = ''; // Limpar o contêiner de artigos antes de adicionar novos artigos

  if (articles.length === 0) {
    // Se não houver artigos, adicionar a classe 'no-articles' e exibir a mensagem
    articleContainer.classList.add('no-articles');
    paginationContainer.style.display = 'none'
    articleContainer.innerHTML = '<p>Nenhum artigo encontrado</p>';
  } else {
    // Se houver artigos, remover a classe 'no-articles'
    articleContainer.classList.remove('no-articles');

    const fragment = document.createDocumentFragment();
    for (const article of articles) {
      const articleInstance = new Article(article);
      const articleHTML = await articleInstance.render();
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = articleHTML.trim();
      fragment.appendChild(tempDiv.firstChild);
    }
    paginationContainer.style.display = "flex";
    articleContainer.appendChild(fragment);
    currentPage = pageNumber;
    updatePageNumbers(totalPages,id);

    window.history.pushState({}, "", `perfil?page=${pageNumber}&id=${id}`);

    handleImageResolution();
  }

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









