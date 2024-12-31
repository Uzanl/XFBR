const articleContainer = document.querySelector(".article-container");
const cmbStaus = document.getElementById('cmbStatus');
let selectedStatus = 'aprovado'; // Default status
let currentPage = 1;
let isLoading = false; // Prevent multiple requests at once

// Evento para mudança de status
if (cmbStaus) {
  cmbStaus.addEventListener('change', async (event) => {
    selectedStatus = event.target.value;
    currentPage = 1;
    articleContainer.innerHTML = ''; // Clear existing articles
    await loadArticles(currentPage, selectedStatus);
    setupIntersectionObserver(); 
  });
}

// Classe para renderizar os artigos
class Article {
  constructor(articleData) {
    Object.assign(this, articleData);
  }

  async render(index) {
    const originalSrc = this.imagem_url;
    //const newSrc = index === 0 ? originalSrc.replace(".webp", "_firstchild.webp") : originalSrc;
    return `
      <div class="article" data-id="${this.id_artigo}" onclick="openArticle(${this.id_artigo})">
        <img src="${originalSrc}" alt="${this.titulo}" width="860" height="483" data-original-src="${originalSrc}" loading="high">
        <h1>${this.titulo}</h1>
        <p>${this.previa_conteudo}</p>
        <p2>Postado por ${this.login_usu} em ${this.data_formatada}</p2>
      </div>
    `;
  }
}

// Função para buscar os artigos
const fetchArticles = async (pageNumber, selectedStatus) => {
  if (isLoading) return; // Prevent multiple requests

  isLoading = true; // Start loading
  try {
    const responseArticles = await fetch(`/get-articles/${pageNumber}?status=${selectedStatus}`);
    const { articles, totalPages } = await responseArticles.json();
    isLoading = false; // Stop loading
    return { articles, totalPages };
  } catch (error) {
    console.error("Error fetching articles:", error);
    isLoading = false;
    return { articles: [], totalPages: 0 };
  }
};

// Função para carregar os artigos
const loadArticles = async (pageNumber, selectedStatus) => {
  const { articles: newArticles, totalPages: newTotalPages } = await fetchArticles(pageNumber, selectedStatus);
  if (newArticles.length === 0 && pageNumber === 1) {
    articleContainer.classList.add('no-articles');
    articleContainer.innerHTML = '<p>Nenhum artigo encontrado</p>';
  } else {
    articleContainer.classList.remove('no-articles');
    const fragment = document.createDocumentFragment();
    for (const article of newArticles) {
      const articleInstance = new Article(article);
      const articleHTML = await articleInstance.render();
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = articleHTML.trim();
      fragment.appendChild(tempDiv.firstChild);
    }
    articleContainer.appendChild(fragment);
    currentPage = pageNumber;
  }
};

// Função para abrir um artigo
const openArticle = (id) => {
  window.location.href = `artigo/${id}`;
};

// Função para configurar o Intersection Observer
const setupIntersectionObserver = () => {
  const observer = new IntersectionObserver(async (entries) => {
    // Verifica se o último artigo foi alcançado
    if (entries[0].isIntersecting && !isLoading) {
      currentPage++;
      await loadArticles(currentPage, selectedStatus);
    }
  }, { threshold: 1.0 });

  // Observa o último artigo da lista
  const lastArticle = document.querySelector(".article:last-child");
  if (lastArticle) {
    observer.observe(lastArticle);
  }
};

// Função inicial para carregar os artigos
(async () => {
  if (cmbStaus) document.getElementById('cmbStatus').value = selectedStatus;
  await loadArticles(currentPage, selectedStatus);
  setupIntersectionObserver(); // Configura o Intersection Observer
})();