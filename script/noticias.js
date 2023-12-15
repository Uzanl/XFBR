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
    const articleElement = document.createElement("div");
    articleElement.classList.add("article");
    articleElement.setAttribute("data-id", this.id_artigo);
    const imageElement = document.createElement("img");
    imageElement.alt = this.titulo;
    imageElement.width = "860";
    imageElement.height = "483";
    const originalSrc = this.imagem_url;
    const newSrc = (index === 0 ? originalSrc.replace(".webp", "_firstchild.webp") : originalSrc);
    imageElement.src = newSrc;
    imageElement.dataset.originalSrc = originalSrc;
    const titleElement = document.createElement("h1");
    titleElement.textContent = this.titulo;
    const openArticleHandler = () => openArticle(this.id_artigo);
    [imageElement, titleElement].forEach(elem => elem.addEventListener("click", openArticleHandler));
    const previewElement = document.createElement("p");
    previewElement.textContent = this.previa_conteudo;

    const userInfoElement = document.createElement("p2");
    userInfoElement.textContent = `Postado por ${this.login_usu} em ${this.data_formatada}`;

    [imageElement, titleElement, previewElement, userInfoElement].forEach(elem => articleElement.appendChild(elem));
    return articleElement;
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
  pageNumbersContainer.innerHTML = " ";

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
  })

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

async function fetchArticles(pageNumber) {
  try {
    let itemsPerPage = 8
    const response = await fetch(`/get-articles/${pageNumber}`);
    const data = await response.json();
    return { articles: data.articles, totalPages: Math.ceil(data.totalCount / itemsPerPage) };
  } catch (error) {
    console.error("Error fetching articles:", error);
    return { articles: [], totalPages: 0 };
  }
}

async function loadArticles(pageNumber) {
  const { articles: newArticles, totalPages: newTotalPages } = await fetchArticles(pageNumber);
  const fragment = document.createDocumentFragment();
  for (const article of newArticles) {
    const articleInstance = new Article(article);
    fragment.appendChild(await articleInstance.render());
  }
  articleContainer.innerHTML = "";
  articleContainer.appendChild(fragment);
  handleImageResolution();
  currentPage = pageNumber;
  updatePageNumbers(newTotalPages);
  window.history.pushState({}, "", `not%C3%ADcias.html?page=${pageNumber}`);
  paginationContainer.style.display = "flex";
}

function openArticle(id) {
  window.location.href = `artigo.html?id=${id}`;
}

(async function () {
  const currentPage = getCurrentPageFromURL();
  await loadArticles(currentPage);
})();




