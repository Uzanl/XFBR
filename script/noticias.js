const articleContainer = document.querySelector(".article-container");
const paginationContainer = document.querySelector(".pagination-container");

const handleImageResolution = () => {
  const screenWidth = window.innerWidth;
  const images = document.querySelectorAll(".article img");

  images.forEach((image, index) => {
    const originalSrc = image.dataset.originalSrc;
    if (screenWidth > 1199) {
      image.src = index === 0 ? originalSrc.replace(".webp", "_firstchild.webp") : originalSrc.replace("_firstchild.webp", ".webp");
    } else if (screenWidth > 768 && screenWidth < 992) {
      image.src = originalSrc.replace(".webp", "_firstchild.webp");
    } else if (screenWidth >= 992 && screenWidth <= 1199) {
      image.src = originalSrc.replace(".webp", "_firstchild.webp");
    } else if (screenWidth > 320 && screenWidth <= 480) {
      image.src = originalSrc.replace(".webp", "_432.webp");
    } else if (screenWidth > 480 && screenWidth <= 768) {
      image.src = originalSrc.replace(".webp", "_720.webp");
    } else if (screenWidth <= 320) {
      image.src = originalSrc.replace("_firstchild.webp", ".webp");
    }
  });
};

window.addEventListener("resize", handleImageResolution);

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
    `;
  }
}

const getCurrentPageFromURL = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const pageParam = urlParams.get("page");
  return pageParam && /^(?:\d)+$/.test(pageParam) ? Math.max(parseInt(pageParam, 10), 1) : 1;
};

let currentPage = getCurrentPageFromURL();

const updatePageNumbers = (totalPages) => {
  const pageNumbersContainer = document.querySelector(".page-numbers");
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
    pageLink.href = `not%C3%ADcias.html?page=${i}`;
    pageLink.textContent = i;
    pageLink.classList.toggle("active", i === currentPage);
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
};

const handlePageButtonClick = (offset, totalPages) => async () => {
  const nextPage = currentPage + offset;
  if (nextPage >= 1 && nextPage <= totalPages) {
    await loadArticles(nextPage);
  }
};

$('#cmbStatus').on('change', () => loadArticles(currentPage));

const fetchArticles = async (pageNumber) => {
  const selectedStatus = $('#cmbStatus').val();
  try {
    const itemsPerPage = 8;
    const response = await fetch(`/get-articles/${pageNumber}?status=${selectedStatus}`);
    const data = await response.json();
    return { articles: data.articles, totalPages: Math.ceil(data.totalCount / itemsPerPage) };
  } catch (error) {
    console.error("Error fetching articles:", error);
    return { articles: [], totalPages: 0 };
  }
};

const loadArticles = async (pageNumber) => {
  const { articles: newArticles, totalPages: newTotalPages } = await fetchArticles(pageNumber);
  let articlesHTML = "";
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
};

const verificarTipoUsuario = async () => {
  try {
    const response = await fetch('/getTipoUsuario');
    if (!response.ok) throw new Error(`Erro na solicitação: ${response.status}`);
    const data = await response.json();
    if (data.tipoUsuario === "administrador") {
      document.querySelector(".status-news").style.display = "flex";
    }
  } catch (error) {
    console.error('Erro ao obter o tipo do usuário:', error);
  }
};

const openArticle = (id) => {
  window.location.href = `artigo.html?id=${id}`;
};

(async () => {
  currentPage = getCurrentPageFromURL();
  await loadArticles(currentPage);
  await verificarTipoUsuario();
})();
