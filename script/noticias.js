const articleContainer = document.querySelector(".article-container");
const paginationContainer = document.querySelector(".pagination-container");

window.addEventListener("resize", handleImageResolution);

function handleImageResolution() {
  const screenWidth = window.innerWidth;
  const images = document.querySelectorAll(".article img");

  images.forEach(function(image, index){
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
    const newSrc = (index === 0 ? originalSrc.replace(".webp", "_firstchild.webp") : originalSrc);
    const imageElement = `<img src="${newSrc}" alt="${this.titulo}" width="860" height="483" data-original-src="${originalSrc}">`;
    const titleElement = `<h1>${this.titulo}</h1>`;
    const previewElement = `<p>${this.previa_conteudo}</p>`;
    const userInfoElement = `<p2>Postado por ${this.login_usu} em ${this.data_formatada}</p2>`;
    const openArticleHandler = `openArticle(${this.id_artigo})`;
    const articleHTML = `<div class="article" data-id="${this.id_artigo}" onclick="${openArticleHandler}">
                          ${imageElement}
                          ${titleElement}
                          ${previewElement}
                          ${userInfoElement}
                        </div>`;
    return articleHTML;
  }
}

function getCurrentPageFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const pageParam = urlParams.get("page");
  if (pageParam && /^(?:\d)+$/.test(pageParam)) {
    const parsedPage = parseInt(pageParam, 10);
    return parsedPage > 0 ? parsedPage : 1;
  }
  return 1;
}

let currentPage = getCurrentPageFromURL();

function updatePageNumbers(totalPages) {
  const pageNumbersContainer = document.querySelector(".page-numbers");
  pageNumbersContainer.innerHTML = "";

  const maxPageIndices = 8;
  const halfMaxIndices = Math.floor(maxPageIndices / 2);
  let startPage = Math.max(1, currentPage - halfMaxIndices);
  let endPage = Math.min(totalPages, startPage + maxPageIndices - 1);

  if (endPage - startPage < maxPageIndices - 1) {
    startPage = Math.max(1, endPage - maxPageIndices + 1);
  }

  const fragment = document.createDocumentFragment();
  for (let i = startPage; i <= endPage; i++) {
    const pageLink = document.createElement("a");
    pageLink.href = `not%C3%ADcias.html?page=${i}`;
    pageLink.textContent = i;
    pageLink.classList.toggle("active", i === currentPage);
    pageLink.classList.add("page-link");
    fragment.appendChild(pageLink);
  }

  paginationContainer.addEventListener("click", (event) => {
    if (event.target.classList.contains("page-link")) {
      const pageNumber = parseInt(event.target.textContent);
      loadArticles(pageNumber);
    } else if (event.target.classList.contains("prev-page")) {
      handlePageButtonClick(-1, totalPages)();
    } else if (event.target.classList.contains("next-page")) {
      handlePageButtonClick(1, totalPages)();
    }
  });

  const prevPageButton = paginationContainer.querySelector(".prev-page");
  const nextPageButton = paginationContainer.querySelector(".next-page");
  prevPageButton.style.display = currentPage > 1 ? "block" : "none";
  nextPageButton.style.display = currentPage < totalPages ? "block" : "none";

  pageNumbersContainer.appendChild(fragment);
}

const handlePageButtonClick = (offset, totalPages) => async () => {
  const nextPage = currentPage + offset;
  if (nextPage >= 1 && nextPage <= totalPages) {
    await loadArticles(nextPage);
  }
};

// Adicione o evento onchange ao combobox
$('#cmbStatus').on('change', function() {
  loadArticles(currentPage);
});

async function fetchArticles(pageNumber) {

  const selectedStatus = $('#cmbStatus').val();
  try {
    let itemsPerPage = 8
    const response = await fetch(`/get-articles/${pageNumber}?status=${selectedStatus}`);
    const data = await response.json();
    return { articles: data.articles, totalPages: Math.ceil(data.totalCount / itemsPerPage) };
  } catch (error) {
    console.error("Error fetching articles:", error);
    return { articles: [], totalPages: 0 };
  }
}

async function loadArticles(pageNumber) {
  const { articles: newArticles, totalPages: newTotalPages } = await fetchArticles(pageNumber);
  let articlesHTML = '';
  for (const article of newArticles) {
    const articleInstance = new Article(article);
    articlesHTML += await articleInstance.render();
  }
  articleContainer.innerHTML = articlesHTML;
  handleImageResolution();
  currentPage = pageNumber;
  updatePageNumbers(newTotalPages);
  window.history.pushState({}, "", `not%C3%ADcias.html?page=${pageNumber}`);
  paginationContainer.style.display = "flex";
}

async function verificarTipoUsuario() {
  try {
    // Faça uma solicitação HTTP para obter o tipo do usuário
    const response = await fetch('/getTipoUsuario');
    
    if (!response.ok) throw new Error(`Erro na solicitação: ${response.status}`);
    
    const data = await response.json();
    const tipoUsuario = data.tipoUsuario;

    // Verifique se o tipo do usuário é "administrador" e exiba a div se for verdadeiro
    if (tipoUsuario === "administrador") {
      const divStatusNews = document.querySelector(".status-news");
      divStatusNews.style.display = "flex";
    }
  } catch (error) {
    console.error('Erro ao obter o tipo do usuário:', error);
  }
}

function openArticle(id) {
  window.location.href = `artigo.html?id=${id}`;
}

(async function () {
  const currentPage = getCurrentPageFromURL();
  await loadArticles(currentPage);
  await verificarTipoUsuario();
})();




