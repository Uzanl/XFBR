import { updateLoginButtonVisibility } from './auth.js';

// Chamar a função para atualizar a visibilidade do botão de login ao carregar a página
updateLoginButtonVisibility();

const articleContainer = document.querySelector('.article-container');

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
  pageNumbersContainer.innerHTML = ''; // Limpar os números de página existentes

  const maxPageIndices = 8; // Quantidade máxima de índices de página exibidos
  const halfMaxIndices = Math.floor(maxPageIndices / 2);

  let startPage = currentPage - halfMaxIndices;
  let endPage = currentPage + halfMaxIndices;

  startPage = startPage <= 0 ? 1 : startPage;
  endPage = startPage <= 0 ? Math.min(maxPageIndices, totalPages) : endPage;

  endPage = endPage > totalPages ? totalPages : endPage;
  startPage = endPage > totalPages ? Math.max(1, totalPages - maxPageIndices + 1) : startPage;
  
  for (let i = startPage; i <= endPage; i++) {
    const pageLink = document.createElement('a');
   
    pageLink.textContent = i;
    pageLink.classList.toggle('active', i === currentPage);
    pageLink.addEventListener('click', loadArticles.bind(null, i));
    pageNumbersContainer.appendChild(pageLink);
  }

  const paginationContainer = document.querySelector('.pagination-container');
  const prevPageButton = paginationContainer.querySelector('.prev-page');
  const nextPageButton = paginationContainer.querySelector('.next-page');
  prevPageButton.addEventListener('click', handlePageButtonClick(-1, totalPages));
  nextPageButton.addEventListener('click', handlePageButtonClick(1, totalPages));  
  prevPageButton.style.display = currentPage > 1 ? 'block' : 'none';
  nextPageButton.style.display = currentPage < totalPages ? 'block' : 'none';
}

async function fetchArticles(pageNumber) {
  try {
    let itemsPerPage = 8
    const response = await fetch(`/get-articles/${pageNumber}`);
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

  const paginationContainer = document.querySelector('.pagination-container');
  paginationContainer.style.display = 'block';
}

const handlePageButtonClick = (offset, totalPages) => async (event) => {
  const nextPage = currentPage + offset;
  (nextPage >= 1 && nextPage <= totalPages) && await loadArticles(nextPage);
};

function openArticle(id) {
  window.location.href = `artigo.html?id=${id}`;
}

loadArticles(currentPage);



function updateProfileDescription() {
    const descriptionParagraph = document.querySelector('.profile-description p'); // Parágrafo da descrição
    const descriptionTextarea = document.getElementById('description-input'); // Textarea da descrição
    const updateButton = document.getElementById('update-description-button'); // Botão de atualização
    
    
    // Função para atualizar a descrição no servidor
    function updateDescriptionOnServer(newDescription) {
      fetch('/update-description', {
        method: 'POST',
        credentials: 'same-origin', // Mantém as credenciais no mesmo domínio
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ description: newDescription }) // Envia a nova descrição para o servidor
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          descriptionParagraph.textContent = newDescription; // Atualiza o parágrafo com a nova descrição
          descriptionParagraph.style.color = "black"; // Volta à cor padrão do texto
        } else {
          console.error("Erro ao atualizar a descrição:", data.error);
        }
      })
      .catch(error => {
        console.error("Erro na solicitação de atualização:", error);
      });
    }
    
    // Verifica se a descrição está vazia e exibe o aviso se necessário
    if (descriptionTextarea.value.trim() === "") {
   //   showEmptyDescriptionWarning();
    }
    
    // Define um ouvinte de evento para o botão de atualização
    updateButton.addEventListener('click', () => {
      const updatedDescription = descriptionTextarea.value.trim();
      
      if (updatedDescription === "") {
       // showEmptyDescriptionWarning(); // Exibe o aviso se a descrição estiver vazia
      } else {
        updateDescriptionOnServer(updatedDescription); // Atualiza a descrição no servidor
      }
    });
  }

/*  function updateProfileImage() {
    const profileImage = document.querySelector('.imagem-perfil');
    const cameraIcon = document.querySelector('.image-edit-icon');
    const imageInput = document.getElementById('image-input');
  
      imageInput.addEventListener('change', (event) => {
        const selectedImage = event.target.files[0];
  
        if (selectedImage) {
          const reader = new FileReader();
  
          reader.onload = () => {
            profileImage.src = reader.result; // Atualiza a imagem na página
  
            // Enviar a imagem para o servidor como JSON
            const imageData = {
              image: reader.result, // URL de dados da imagem
              imageName: selectedImage.name, // Nome da imagem
            };
  
            fetch('/upload', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(imageData), // Enviar como JSON
            })
            .then(response => response.json())
            .then(data => {
              console.log(data.message);
            })
            .catch(error => {
              console.error('Erro ao enviar a imagem:', error);
            });
          };
  
          reader.readAsDataURL(selectedImage); // Lê a imagem como um URL de dados
        }
      });
    
  }*/
  
// Chama a função quando a página estiver carregada
document.addEventListener('DOMContentLoaded', () => {
  // Fetch para obter informações do usuário

  /*updateProfileDescription();*/
 /* updateProfileImage();*/

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

    fetch(`/get-user-info/${id}`, {
      method: 'GET',
      credentials: 'same-origin' // Mantém as credenciais no mesmo domínio
    })    
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro ao obter informações do usuário');
      }
      return response.json();
    })
    // ...
  .then(data => {
    const descriptionParagraph = document.querySelector('.profile-description p');
    const profileImage = document.querySelector('.imagem-perfil');
    const gamertag = document.querySelector('.gamertag');
    const gamerscoreValue = document.querySelector('.gamerscore-value');
    const descProfile = document.querySelector('.desc-profile');
    const largeTextBox = document.getElementById('description-input');
    const BtnUpdateDescription = document.getElementById('update-description-button');
    const ImgEditIcon = document.querySelector('.image-edit-icon');
  
  
    if(data.gamertag){
     //gamertag.textContent = `Gamertag: ${data.gamertag}`;
     gamertag.textContent = data.gamertag;
     gamerscoreValue.textContent = data.gamerscore;
     profileImage.src = data.imageUrl;
     descProfile.style.display= 'none';
     largeTextBox.style.display = 'none';
     BtnUpdateDescription.style.display = 'none';
     ImgEditIcon.style.display = 'none';
    }else{
      if (data.description) {
        descriptionParagraph.textContent = data.description;
      } else {
        descriptionParagraph.textContent = "Sua descrição atual do perfil está vazia. Atualize sua descrição.";
        descriptionParagraph.style.color = "red"; // Define a cor do aviso
      }
    
      if (data.imageUrl) {
        profileImage.src = data.imageUrl; // Atualiza o atributo src da imagem com a URL da imagem
      }
    }
  })
  .catch(error => {
    console.error("Erro na solicitação de informações do usuário:", error);
  });

   //Suponha que você tem um elemento com o ID 'gamercard' que contém o gamercard.
 /* const gamercardElement = document.querySelector('.profile');

 // Adicione um evento de clique ao botão para capturar o gamercard como uma imagem
  document.querySelector('.downloadButton').addEventListener('click', function () {
    html2canvas(gamercardElement).then(function (canvas) {
    //   Converta o canvas em uma URL de imagem em formato PNG
     const imgData = canvas.toDataURL('image/png');
  
   //    Crie um link temporário para o download da imagem
      const link = document.createElement('a');
     link.href = imgData;
  
       //Defina o atributo 'download' para o nome do arquivo desejado com a extensão .png
    link.download = 'gamercard.png';
  
      // Simule um clique no link para iniciar o download
      link.click();
   });
 });*/
});



