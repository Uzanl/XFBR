const articleContainer = document.querySelector(".article-container");
const paginationContainer = document.querySelector(".pagination-container");
const prevPageButton = paginationContainer.querySelector(".prev-page");
const nextPageButton = paginationContainer.querySelector(".next-page");
const pageNumbersContainer = document.querySelector(".page-numbers");
const cmbStaus = document.getElementById('cmbStatus');
const statusItems = document.querySelectorAll(".status-item-container p");
const article = document.querySelector(".article")

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

if (cmbStaus) {
  // Event listener para mudança de status
  cmbStaus.addEventListener('change', async (event) => {
    selectedStatus = event.target.value;
    currentPage = 1;
    window.history.pushState({}, "", `noticias?page=${currentPage}&status=${selectedStatus}`);
    await loadArticles(currentPage, selectedStatus);
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
        <img src="${newSrc}" alt="${this.titulo}" width="860" height="483" data-original-src="${originalSrc}" loading="high">
        <h1>${this.titulo}</h1>
        <p>${this.previa_conteudo}</p>
        <p2>Postado por ${this.login_usu} em ${this.data_formatada}</p2>
      </div>
    `;
  }

}

const getCurrentPageAndStatusFromURL = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const pageParam = urlParams.get("page");
  const statusParam = urlParams.get("status") || 'aprovado';
  const currentPage = pageParam && /^(?:\d)+$/.test(pageParam) ? Math.max(parseInt(pageParam, 10), 1) : 1;
  return { currentPage, selectedStatus: statusParam };
};

let { currentPage, selectedStatus } = getCurrentPageAndStatusFromURL();

const updatePageNumbers = (totalPages) => {
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
    pageLink.href = `noticias?page=${i}&status=${selectedStatus}`;
    pageLink.classList.add("page-link");
    pageLink.textContent = i;
    pageLink.classList.toggle("active", i === currentPage);
    fragment.appendChild(pageLink);
  }

  prevPageButton.href = `noticias?page=${Math.max(currentPage - 1, 1)}&status=${selectedStatus}`; //bug aqui.
  prevPageButton.style.display = currentPage > 1 ? "block" : "none";

  nextPageButton.href = `noticias?page=${Math.min(currentPage + 1, totalPages)}&status=${selectedStatus}`; //bug aqui.
  nextPageButton.style.display = currentPage < totalPages ? "block" : "none";

  pageNumbersContainer.appendChild(fragment);
};

paginationContainer.addEventListener("click", async (event) => {
  event.preventDefault();

  if (event.target.classList.contains("page-link")) {
    const pageNumber = parseInt(event.target.textContent);
    await loadArticles(pageNumber, selectedStatus);
  } else if (event.target.classList.contains("prev-page") || event.target.classList.contains("next-page")) {
    const pageParam = new URL(event.target.href).searchParams.get("page");
    const pageNumber = parseInt(pageParam);
    await loadArticles(pageNumber, selectedStatus);
  }
});

const fetchArticles = async (pageNumber, selectedStatus) => {
  try {
    const responseArticles = await fetch(`/get-articles/${pageNumber}?status=${selectedStatus}`);
    const { articles, totalPages } = await responseArticles.json();
    return { articles, totalPages };
  } catch (error) {
    console.error("Error fetching articles:", error);
    return { counts: {}, articles: [], totalPages: 0 };
  }
};

const loadArticles = async (pageNumber, selectedStatus) => {
  const { articles: newArticles, totalPages: newTotalPages } = await fetchArticles(pageNumber, selectedStatus);
  while (articleContainer.firstChild) { articleContainer.removeChild(articleContainer.firstChild); }

  if (newArticles.length === 0) {
    // Se não houver artigos, adicionar a classe 'no-articles' e exibir a mensagem
    articleContainer.classList.add('no-articles');
    paginationContainer.style.display = 'none'
    articleContainer.innerHTML = '<p>Nenhum artigo encontrado</p>';
  } else {
    // Se houver artigos, remover a classe 'no-articles'
    articleContainer.classList.remove('no-articles');

    const fragment = document.createDocumentFragment();
    for (const article of newArticles) {
      const articleInstance = new Article(article);
      const articleHTML = await articleInstance.render();
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = articleHTML.trim();
      fragment.appendChild(tempDiv.firstChild);
    }
    paginationContainer.style.display = "flex";
    articleContainer.appendChild(fragment);
    currentPage = pageNumber;
    updatePageNumbers(newTotalPages);

    window.history.pushState({}, "", `noticias?page=${pageNumber}&status=${selectedStatus}`);

    handleImageResolution();
  }

};
const openArticle = (id) => {
  window.location.href = `artigo?id=${id}`;
};

(async () => {
  const { currentPage, selectedStatus } = getCurrentPageAndStatusFromURL();
  if (cmbStaus) document.getElementById('cmbStatus').value = selectedStatus;
  await loadArticles(currentPage, selectedStatus);
})();
