import { updateLoginButtonVisibility } from './auth.js';

// Chamar a função para atualizar a visibilidade do botão de login ao carregar a página
updateLoginButtonVisibility();

let i = 0;

class Article {
  constructor(id_artigo,titulo,conteudo,data_publicacao,id_usu,imagem_url,previa_conteudo,login_usu) {
    this.id_artigo = id_artigo;
    this.conteudo = conteudo;
    this.titulo = titulo;
    this.previa_conteudo = previa_conteudo;
    this.data_publicacao = data_publicacao;
    this.id_usu = id_usu;
    this.imagem_url = imagem_url;
    this.login_usu  = login_usu;
   // this.isFirstArticle = isFirstArticle;
  }

  async render() {

  

   
   // console.log(i);

    

    const articleElement = document.createElement('div');
    articleElement.classList.add('article');
    articleElement.setAttribute('data-id', this.id_artigo);

 

    const imageElement = document.createElement('img');
   // imageElement.src = this.imagem_url;
    imageElement.alt = this.titulo;
    if (i==0) {
      i++
      imageElement.src = this.imagem_url.replace('.webp', '_firstchild.webp');
     
    } else {
      imageElement.src = this.imagem_url;
    }
    


    imageElement.addEventListener('click', () => {
      openArticle(this.id_artigo);
    });

    const titleElement = document.createElement('h1');
    titleElement.textContent = this.titulo;
    titleElement.addEventListener('click', () => {
      openArticle(this.id_artigo);
    });

    const previewElement = document.createElement('p');
    previewElement.textContent = this.previa_conteudo;

   // const userName = await getUserName(this.id_usu);
   
    const userInfoElement = document.createElement('p2');
    userInfoElement.textContent = `Postado por ${this.login_usu} em ${formatDate(this.data_publicacao)}`;

    articleElement.appendChild(imageElement);
    articleElement.appendChild(titleElement);
    articleElement.appendChild(previewElement);
    articleElement.appendChild(userInfoElement);

   
    return articleElement;
  }

 
}





function formatDate(dateString) {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', options);
}

const articles = [];
let currentPage = 1;
let itemsPerPage = 8;
let totalPages = 0;

async function fetchTotalArticleCount() {
  try {
    const response = await fetch('/get-article-count-profile'); // Endpoint para obter a contagem total de artigos
    const data = await response.json();
    totalPages = Math.ceil(data.count / itemsPerPage); // Calcular o número total de páginas
    //console.log(totalPages);
  } catch (error) {
    console.error('Error fetching total article count:', error);
  }
}





function updatePageNumbers(totalPages) {
  const pageNumbersContainer = document.querySelector('.page-numbers');
  pageNumbersContainer.innerHTML = ''; // Limpar os números de página existentes

  const maxPageIndices = 8; // Quantidade máxima de índices de página exibidos
  const halfMaxIndices = Math.floor(maxPageIndices / 2);

  let startPage = currentPage - halfMaxIndices;
  let endPage = currentPage + halfMaxIndices;

  if (startPage <= 0) {
    startPage = 1;
    endPage = Math.min(maxPageIndices, totalPages);
  }

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, totalPages - maxPageIndices + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    const pageLink = document.createElement('a');
    pageLink.href = '#';
    pageLink.textContent = i;

    if (i === currentPage) {
      pageLink.classList.add('active'); // Adicionar a classe 'active' diretamente aqui
    }

    pageLink.addEventListener('click', () => {
      loadArticles(i);
    });

    pageNumbersContainer.appendChild(pageLink);
  }

  const paginationContainer = document.querySelector('.pagination-container');
  const prevPageButton = paginationContainer.querySelector('.prev-page');
  const nextPageButton = paginationContainer.querySelector('.next-page');

  if (currentPage > 1) {
    prevPageButton.style.display = 'block';
  } else {
    prevPageButton.style.display = 'none';
  }

  if (currentPage < totalPages) {
    nextPageButton.style.display = 'block';
  } else {
    nextPageButton.style.display = 'none';
  }

  if(currentPage== totalPages){
    console.log("teste");
  }
}

async function fetchAndAppendArticles(pageNumber, id) {
  try {
    const response = await fetch(`/get-articles-profile?page=${pageNumber}&id=${id}`);
    const data = await response.json();
    console.log(data);
    const newArticles = data.articles;
    articles.push(...newArticles);
  } catch (error) {
    console.error('Error fetching and appending articles:', error);
  }
}

function clearArticleContainer() {
  const articleContainer = document.querySelector('.article-container');
  articleContainer.innerHTML = '';
  articles.length = 0;
  i = 0;
}

async function loadArticles(pageNumber) {

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  clearArticleContainer();
  await fetchAndAppendArticles(pageNumber,id);

  const articleContainer = document.querySelector('.article-container');

  for (const articleData of articles) {
    const { id_artigo, titulo, conteudo, data_publicacao, id_usu, imagem_url, previa_conteudo,login_usu} = articleData;
    const article = new Article(id_artigo, titulo, conteudo, data_publicacao, id_usu, imagem_url, previa_conteudo,login_usu);
    console.log(article);
    articleContainer.appendChild(await article.render());
  }

  currentPage = pageNumber;
  updatePageNumbers(totalPages);
}




// Captura o número da página ao clicar nos botões "Anterior" e "Próximo"
const prevPageButton = document.querySelector('.prev-page');
const nextPageButton = document.querySelector('.next-page');

prevPageButton.addEventListener('click', event => {
  event.preventDefault();
  if (currentPage > 1) {
    loadArticles(currentPage - 1);
  }
});

nextPageButton.addEventListener('click', event => {
  event.preventDefault();
  if (currentPage < totalPages) {
    loadArticles(currentPage + 1);
  }
});

function openArticle(id) {
  window.location.href = `artigo.html?id=${id}`;
}


fetchTotalArticleCount().then(() => {
  updatePageNumbers(totalPages);
  loadArticles(currentPage);
});

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


  
  function updateProfileImage() {
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
    
  }
  
// Chama a função quando a página estiver carregada
document.addEventListener('DOMContentLoaded', () => {
  // Fetch para obter informações do usuário

 

  updateProfileDescription();
  updateProfileImage();

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  console.log(id)

   if(id){
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
     gamertag.textContent = `Gamertag: ${data.gamertag}`;
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


   }else{
    
    fetch('/get-user-info', {
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
     gamertag.textContent = `Gamertag: ${data.gamertag}`;
     gamerscoreValue.textContent = data.gamerscore;
     profileImage.src = data.profilepic;
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
   }
  

  

   //Suponha que você tem um elemento com o ID 'gamercard' que contém o gamercard.
  //const gamercardElement = document.querySelector('.profile');

  // Adicione um evento de clique ao botão para capturar o gamercard como uma imagem
  //document.querySelector('.downloadButton').addEventListener('click', function () {
   // html2canvas(gamercardElement).then(function (canvas) {
      // Converta o canvas em uma URL de imagem em formato PNG
   //  const imgData = canvas.toDataURL('image/png');
  
      // Crie um link temporário para o download da imagem
   //   const link = document.createElement('a');
   //  link.href = imgData;
  
       //Defina o atributo 'download' para o nome do arquivo desejado com a extensão .png
  //  link.download = 'gamercard.png';
  
      // Simule um clique no link para iniciar o download
 ///     link.click();
 //  });
 //});
});



