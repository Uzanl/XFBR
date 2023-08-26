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

  if (data.description) {
    descriptionParagraph.textContent = data.description;
  } else {
    descriptionParagraph.textContent = "Sua descrição atual do perfil está vazia. Atualize sua descrição.";
    descriptionParagraph.style.color = "red"; // Define a cor do aviso
  }

  if (data.imageUrl) {
    profileImage.src = data.imageUrl; // Atualiza o atributo src da imagem com a URL da imagem
  }
})
.catch(error => {
  console.error("Erro na solicitação de informações do usuário:", error);
});




 
});


  