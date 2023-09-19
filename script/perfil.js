import { updateLoginButtonVisibility } from './auth.js';

// Chamar a função para atualizar a visibilidade do botão de login ao carregar a página
updateLoginButtonVisibility();





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

   //Suponha que você tem um elemento com o ID 'gamercard' que contém o gamercard.
  const gamercardElement = document.querySelector('.profile');

  // Adicione um evento de clique ao botão para capturar o gamercard como uma imagem
  document.querySelector('.downloadButton').addEventListener('click', function () {
    html2canvas(gamercardElement).then(function (canvas) {
      // Converta o canvas em uma URL de imagem em formato PNG
     const imgData = canvas.toDataURL('image/png');
  
      // Crie um link temporário para o download da imagem
      const link = document.createElement('a');
     link.href = imgData;
  
       //Defina o atributo 'download' para o nome do arquivo desejado com a extensão .png
    link.download = 'gamercard.png';
  
      // Simule um clique no link para iniciar o download
      link.click();
   });
 });










});



