function toggleSidebar() {
    var sidebar = document.getElementById('sidebar');
    var toggleBtn = document.querySelector('.toggle-btn');

    sidebar.classList.toggle('active');
    toggleBtn.classList.toggle('active');
  }

  class Article {
    constructor(id, imageUrl, title, content) {
      this.id = id;
      this.imageUrl = imageUrl;
      this.title = title;
      this.content = content;
    }

    render() {
      const articleElement = document.createElement('div');
      articleElement.classList.add('article');
      articleElement.setAttribute('data-id', this.id);
      articleElement.addEventListener('click', () => {
        openArticle(this.id);
      });

      const imageElement = document.createElement('img');
      imageElement.src = this.imageUrl;
      imageElement.style.width = '243.33px';
      imageElement.style.height = '193.95px';

      const titleElement = document.createElement('h2');
      titleElement.textContent = this.title;

      const contentElement = document.createElement('p');
      contentElement.textContent = this.content;

      articleElement.appendChild(imageElement);
      articleElement.appendChild(titleElement);
      articleElement.appendChild(contentElement);

      return articleElement;
    }
  }

  const articles = [
    new Article("artigo1", "witcher3.png", "The Witcher 3", "Conteúdo do Artigo 1..."),
    new Article("artigo2", "forza.png", "Forza Horizon 5", "Conteúdo do Artigo 2..."),
    new Article("artigo3", "resident.png", "Resident Evil 4 Remake", "Conteúdo do Artigo 3..."),
    new Article("artigo4", "caminho-para-a-imagem-4.jpg", "Título do Artigo 4", "Conteúdo do Artigo 4..."),
    new Article("artigo5", "caminho-para-a-imagem-5.jpg", "Título do Artigo 5", "Conteúdo do Artigo 5..."),
    new Article("artigo6", "caminho-para-a-imagem-6.jpg", "Título do Artigo 6", "Conteúdo do Artigo 6..."),
    new Article("artigo7", "caminho-para-a-imagem-7.jpg", "Título do Artigo 7", "Conteúdo do Artigo 6...")
  ];

  const articleContainer = document.querySelector('.article-container');
  articles.forEach(article => {
    articleContainer.appendChild(article.render());
  });

  function openArticle(id) {
    window.location.href = `artigo.html?id=${id}`;
  }